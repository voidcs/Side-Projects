import os
import json
import tensorflow as tf
from object_detection.utils import dataset_util
from PIL import Image
import io

coco_annotations = 'label_studio/result.json'  
images_dir = 'label_studio'  
output_path = 'label_studio/output.tfrecord'  # Path where the TFRecord file will be saved
label_map_path = 'label_map.pbtxt'  # Path to save the label map file

def create_label_map():
    label_map = {
        'lamp': 1  
    }
    with open(label_map_path, 'w') as f:
        for key, val in label_map.items():
            f.write(f'item {{\n  id: {val}\n  name: "{key}"\n}}\n')
    return label_map

# Create TFRecord example
def create_tf_example(image_info, annotations, label_map):
    # Normalize path to use forward slashes
    image_path = os.path.join(images_dir, image_info['file_name'].replace("\\", "/"))

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
        x, y, w, h = annotation['bbox']
        xmins.append(x / width)
        xmaxs.append((x + w) / width)
        ymins.append(y / height)
        ymaxs.append((y + h) / height)
        classes_text.append("lamp".encode('utf8'))
        classes.append(label_map["lamp"])

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

with open(coco_annotations, 'r') as f:
    coco_data = json.load(f)

label_map = create_label_map()

# Organize annotations by image_id
annotations_by_image = {}
for annotation in coco_data['annotations']:
    image_id = annotation['image_id']
    if image_id not in annotations_by_image:
        annotations_by_image[image_id] = []
    annotations_by_image[image_id].append(annotation)

# Write TFRecord file
with tf.io.TFRecordWriter(output_path) as writer:
    for image_info in coco_data['images']:
        image_id = image_info['id']
        if image_id in annotations_by_image:
            tf_example = create_tf_example(image_info, annotations_by_image[image_id], label_map)
            writer.write(tf_example.SerializeToString())

print("TFRecord file created successfully.")
