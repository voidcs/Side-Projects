import tensorflow as tf
from tensorflow.keras import layers, models
import matplotlib.pyplot as plt
from tensorflow.keras.callbacks import LearningRateScheduler

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
    
    return image, bbox, class_id

def create_model(input_shape=(128, 128, 3), max_boxes=10):
    base_model = tf.keras.applications.MobileNetV2(input_shape=input_shape,
                                                   include_top=False,
                                                   weights='imagenet')
    base_model.trainable = False

    inputs = layers.Input(shape=input_shape)
    x = base_model(inputs, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dense(128, activation='relu')(x)
    x = layers.Dense(max_boxes * 4, activation='sigmoid')(x)
    outputs = layers.Reshape((max_boxes, 4))(x)

    model = models.Model(inputs, outputs)
    
    return model

def custom_loss(y_true, y_pred):
    # Compute mean squared error only for the valid bounding boxes (non-padded)
    mask = tf.reduce_any(tf.not_equal(y_true, 0.0), axis=-1, keepdims=True)
    loss = tf.reduce_sum(tf.square(y_true - y_pred) * tf.cast(mask, tf.float32), axis=-1)
    return tf.reduce_mean(loss)

def scheduler(epoch, lr):
    if epoch < 10:
        return lr
    else:
        return lr * tf.math.exp(-0.1)

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
model.compile(optimizer='adam', loss=custom_loss, weighted_metrics=[])

# Learning rate scheduler
lr_scheduler = LearningRateScheduler(scheduler)

# Train the model
model.fit(train_dataset, validation_data=val_dataset, epochs=20, callbacks=[lr_scheduler])

# Save the model
model.save('lava_lamp_detector.h5')

# Load the trained model
model = tf.keras.models.load_model('lava_lamp_detector.h5', custom_objects={'custom_loss': custom_loss})

# Make predictions on the validation set
for images, bboxes, class_ids in val_dataset.take(1):
    predictions = model.predict(images)
    for i in range(len(images)):
        plt.figure()
        plt.imshow(images[i].numpy())
        for bbox in predictions[i]:
            ymin, xmin, ymax, xmax = bbox
            plt.gca().add_patch(plt.Rectangle((xmin * 128, ymin * 128), (xmax - xmin) * 128, (ymax - ymin) * 128,
                                              edgecolor='red', facecolor='none', linewidth=2))
        plt.title(f'Predicted BBoxes')
        plt.show()
