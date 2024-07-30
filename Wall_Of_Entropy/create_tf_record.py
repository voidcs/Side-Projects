import os
import json
import tensorflow as tf
from object_detection.utils import dataset_util
from PIL import Image
import io

# Define paths
label_studio_annotations = 'label_studio/result.json'  # Path to your Label Studio results.json file
images_dir = 'label_studio/images'  # Directory containing your images
output_path = 'label_studio/output.tfrecord'  # Path where the TFRecord file will be saved
label_map_path = 'label_map.pbtxt'  # Path to save the label map file

# Create label map
def create_label_map():
    label_map = {
        'lamp': 1  # Update this dictionary based on your labels
    }
    with open(label_map_path, 'w') as f:
        for key, val in label_map.items():
            f.write(f'item {{\n  id: {val}\n  name: "{key}"\n}}\n')
    return label_map

# Create TFRecord example
def create_tf_example(image_path, annotations, label_map):
    with tf.io.gfile.GFile(image_path, 'rb') as fid:
        encoded_image = fid.read()

    image = Image.open(io.BytesIO(encoded_image))
    width, height = image.size

    filename = os.path.basename(image_path).encode('utf8')
    image_format = b'jpeg'

    xmins = []
    xmaxs = []
    ymins = []
    ymaxs = []
    classes_text = []
    classes = []

    for annotation in annotations:
        xmins.append(annotation['bbox']['left'] / width)
        xmaxs.append((annotation['bbox']['left'] + annotation['bbox']['width']) / width)
        ymins.append(annotation['bbox']['top'] / height)
        ymaxs.append((annotation['bbox']['top'] + annotation['bbox']['height']) / height)
        classes_text.append(annotation['label'].encode('utf8'))
        classes.append(label_map[annotation['label']])

    tf_example = tf.train.Example(features=tf.train.Features(feature={
        'image/height': dataset_util.int64_feature(height),
        'image/width': dataset_util.int64_feature(width),
        'image/filename': dataset_util.bytes_feature(filename),
        'image/source_id': dataset_util.bytes_feature(filename),
        'image/encoded': dataset_util.bytes_feature(encoded_image),
        'image/format': dataset_util.bytes_feature(image_format),
        'image/object/bbox/xmin': dataset_util.float_list_feature(xmins),
        'image/object/bbox/xmax': dataset_util.float_list_feature(xmaxs),
        'image/object/bbox/ymin': dataset_util.float_list_feature(ymins),
        'image/object/bbox/ymax': dataset_util.float_list_feature(ymaxs),
        'image/object/class/text': dataset_util.bytes_list_feature(classes_text),
        'image/object/class/label': dataset_util.int64_list_feature(classes),
    }))
    return tf_example

# Load annotations
with open(label_studio_annotations, 'r') as f:
    data = json.load(f)

# Create label map
label_map = create_label_map()

# Write TFRecord file
with tf.io.TFRecordWriter(output_path) as writer:
    for item in data:
        image_path = os.path.join(images_dir, os.path.basename(item['image']))
        tf_example = create_tf_example(image_path, item['annotations'], label_map)
        writer.write(tf_example.SerializeToString())

print("TFRecord file created successfully.")
