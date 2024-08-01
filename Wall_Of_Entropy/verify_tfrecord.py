import tensorflow as tf
from object_detection.utils import dataset_util

def verify_tfrecord(tfrecord_path):
    raw_dataset = tf.data.TFRecordDataset(tfrecord_path)

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

    def _parse_function(example_proto):
        return tf.io.parse_single_example(example_proto, feature_description)

    parsed_dataset = raw_dataset.map(_parse_function)
    record_count = 5
    for parsed_record in parsed_dataset.take(record_count):
        print("Image Height:", parsed_record['image/height'].numpy())
        print("Image Width:", parsed_record['image/width'].numpy())
        print("Filename:", parsed_record['image/filename'].numpy().decode('utf-8'))
        print("Source ID:", parsed_record['image/source_id'].numpy().decode('utf-8'))
        print("Image Format:", parsed_record['image/format'].numpy().decode('utf-8'))
        print("XMin:", tf.sparse.to_dense(parsed_record['image/object/bbox/xmin']).numpy())
        print("XMax:", tf.sparse.to_dense(parsed_record['image/object/bbox/xmax']).numpy())
        print("YMin:", tf.sparse.to_dense(parsed_record['image/object/bbox/ymin']).numpy())
        print("YMax:", tf.sparse.to_dense(parsed_record['image/object/bbox/ymax']).numpy())
        print("Class Text:", [text.decode('utf-8') for text in tf.sparse.to_dense(parsed_record['image/object/class/text']).numpy()])
        print("Class Label:", tf.sparse.to_dense(parsed_record['image/object/class/label']).numpy())
        print("\n")

tfrecord_path = 'label_studio/output.tfrecord'

verify_tfrecord(tfrecord_path)
