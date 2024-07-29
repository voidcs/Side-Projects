import os
import shutil
import random

dataset_dir = './data/all_images'
train_dir = './data/train'
validation_dir = './data/validation'

os.makedirs(train_dir, exist_ok=True)
os.makedirs(validation_dir, exist_ok=True)

split_ratio = 0.8

# Function to shuffle and split the dataset
def shuffle_and_split_dataset():
    images = os.listdir(dataset_dir)
    print(f"Total images found: {len(images)}") 
    
    random.shuffle(images)
    
    split_index = int(split_ratio * len(images))
    train_images = images[:split_index]
    validation_images = images[split_index:]
    
    print(f"Training images: {len(train_images)}") 
    print(f"Validation images: {len(validation_images)}") 

    for image in train_images:
        src_path = os.path.join(dataset_dir, image)
        dst_path = os.path.join(train_dir, image)
        shutil.copyfile(src_path, dst_path)
        print(f"Copied {src_path} to {dst_path}")  
    
    for image in validation_images:
        src_path = os.path.join(dataset_dir, image)
        dst_path = os.path.join(validation_dir, image)
        shutil.copyfile(src_path, dst_path)
        print(f"Copied {src_path} to {dst_path}") 

    print("Dataset shuffle and split completed.")

if __name__ == "__main__":
    shuffle_and_split_dataset()
