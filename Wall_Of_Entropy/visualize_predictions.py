import tensorflow as tf
from tensorflow.keras import layers, models
import matplotlib.pyplot as plt

# Path to your TFRecord file
tfrecord_path = 'label_studio/output.tfrecord'

def parse_tfrecord_fn(example, max_boxes=10):
    feature_description = {
        'image/height': tf.io.FixedLenFeature([], tf.int64),
        'image/width': tf.io.FixedLenFeature([], tf.int64),
        'image/filename': tf.io.FixedLenFeature([], tf.string),
        'image/source_id': tf.io.FixedLenFeature([], tf.string),
        'image/encoded': tf.io.FixedLenFeature([], tf.string),
        'image/format': tf.io.FixedLenFeature([], tf.string),
        'image/object/bbox/xmin': tf.io.VarLenFeature(tf.float32),
        'image/object/bbox/xmax': tf.io.VarLenFeature(tf.float32),
        'image/object/bbox/ymin': tf.io.VarLenFeature(tf.float32),
        'image/object/bbox/ymax': tf.io.VarLenFeature(tf.float32),
        'image/object/class/text': tf.io.VarLenFeature(tf.string),
        'image/object/class/label': tf.io.VarLenFeature(tf.int64),
    }
    example = tf.io.parse_single_example(example, feature_description)
    
    image = tf.image.decode_jpeg(example['image/encoded'], channels=3)
    image = tf.image.resize(image, [128, 128])
    image = image / 255.0
    
    xmin = tf.sparse.to_dense(example['image/object/bbox/xmin'])
    xmax = tf.sparse.to_dense(example['image/object/bbox/xmax'])
    ymin = tf.sparse.to_dense(example['image/object/bbox/ymin'])
    ymax = tf.sparse.to_dense(example['image/object/bbox/ymax'])
    bbox = tf.stack([ymin, xmin, ymax, xmax], axis=-1)
    
    class_id = tf.sparse.to_dense(example['image/object/class/label'])
    
    # Pad the bounding boxes and class labels
    padding = [[0, max_boxes - tf.shape(bbox)[0]], [0, 0]]
    bbox = tf.pad(bbox, padding)
    class_id = tf.pad(class_id, [[0, max_boxes - tf.shape(class_id)[0]]])
    
    return image, tf.concat([bbox, tf.cast(tf.expand_dims(class_id, axis=-1), tf.float32)], axis=-1)

def create_model(input_shape=(128, 128, 3), max_boxes=10):
    base_model = tf.keras.applications.MobileNetV2(input_shape=input_shape,
                                                   include_top=False,
                                                   weights='imagenet')
    base_model.trainable = True  # Allow fine-tuning of base model layers

    inputs = layers.Input(shape=input_shape)
    x = base_model(inputs, training=True)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dense(256, activation='relu')(x)
    x = layers.Dropout(0.5)(x)
    x = layers.Dense(128, activation='relu')(x)
    x = layers.Dropout(0.5)(x)
    bbox_output = layers.Dense(max_boxes * 4, activation='sigmoid')(x)
    bbox_output = layers.Reshape((max_boxes, 4))(bbox_output)
    class_output = layers.Dense(max_boxes, activation='sigmoid')(x)
    outputs = layers.Concatenate()([bbox_output, class_output])

    model = models.Model(inputs, outputs)
    
    return model

def combined_loss(y_true, y_pred):
    # Extract bounding boxes and class labels from y_true and y_pred
    y_true_bbox = y_true[..., :4]
    y_true_class = y_true[..., 4:]
    y_pred_bbox = y_pred[..., :4]
    y_pred_class = y_pred[..., 4:]

    # Compute IoU loss for bounding box regression
    intersection = tf.reduce_sum(tf.minimum(y_true_bbox, y_pred_bbox), axis=-1)
    union = tf.reduce_sum(tf.maximum(y_true_bbox, y_pred_bbox), axis=-1)
    iou_loss = 1.0 - (intersection / union)

    # Compute binary cross-entropy loss for class labels
    class_loss = tf.keras.losses.binary_crossentropy(y_true_class, y_pred_class)

    # Combine the two losses
    total_loss = iou_loss + class_loss

    return tf.reduce_mean(total_loss)

# Create a dataset from the TFRecord file
raw_dataset = tf.data.TFRecordDataset(tfrecord_path)
parsed_dataset = raw_dataset.map(lambda x: parse_tfrecord_fn(x, max_boxes=10))

# Split the dataset into training and validation sets
dataset_size = 107
train_size = int(0.8 * dataset_size)
val_size = dataset_size - train_size

train_dataset = parsed_dataset.take(train_size).shuffle(1000).batch(32).prefetch(buffer_size=tf.data.AUTOTUNE)
val_dataset = parsed_dataset.skip(train_size).take(val_size).batch(32).prefetch(buffer_size=tf.data.AUTOTUNE)

# Create and compile the model
model = create_model(input_shape=(128, 128, 3), max_boxes=10)
model.compile(optimizer='adam', loss=combined_loss)

# Learning rate scheduler
def scheduler(epoch, lr):
    if epoch < 10:
        return lr
    else:
        return lr * tf.math.exp(-0.1)

lr_scheduler = tf.keras.callbacks.LearningRateScheduler(scheduler)

# Train the model
model.fit(train_dataset, validation_data=val_dataset, epochs=20, callbacks=[lr_scheduler])

# Save the model
model.save('lava_lamp_detector.h5')

# Load the trained model
model = tf.keras.models.load_model('lava_lamp_detector.h5', custom_objects={'combined_loss': combined_loss})

# Make predictions on the validation set
for images, bboxes in val_dataset.take(1):
    predictions = model.predict(images)
    for i in range(len(images)):
        plt.figure()
        plt.imshow(images[i].numpy())
        for bbox in predictions[i]:
            ymin, xmin, ymax, xmax, _ = bbox
            plt.gca().add_patch(plt.Rectangle((xmin * 128, ymin * 128), (xmax - xmin) * 128, (ymax - ymin) * 128,
                                              edgecolor='red', facecolor='none', linewidth=2))
        plt.title(f'Predicted BBoxes')
        plt.show()
