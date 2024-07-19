import cv2
import numpy as np
import hashlib
import time
from argon2 import PasswordHasher
from dotenv import load_dotenv
import os

load_dotenv()

rtsp_url = os.getenv("rtsp_url")


def capture_rtsp_stream(rtsp_url):
    cap = cv2.VideoCapture(rtsp_url)

    if not cap.isOpened():
        print(f"Error: Could not open video stream with URL {rtsp_url}")
        return

    last_print_time = time.time()

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Error: Failed to capture frame.")
            break

        current_time = time.time()
        if current_time - last_print_time >= 5:
            # Process the frame to generate entropy
            process_frame(frame)
            last_print_time = current_time

        # Display the frame
        cv2.imshow('RTSP Stream', frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

def process_frame(frame):
    height, width, _ = frame.shape

    overall_hash = hashlib.sha3_256()
    for i in range(height):
        for j in range(width):
            r, g, b = frame[i, j]
            pixel = f"{r:03}{g:03}{b:03}".encode('utf-8')
            overall_hash.update(pixel)
    print(overall_hash.hexdigest())


if __name__ == "__main__":
    capture_rtsp_stream(rtsp_url)