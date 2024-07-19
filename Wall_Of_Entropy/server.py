import cv2
import hashlib
from flask import Flask, jsonify
from dotenv import load_dotenv
import os

load_dotenv()

rtsp_url = os.getenv("rtsp_url")
print(rtsp_url)
app = Flask(__name__)

@app.route('/random_number', methods=['GET'])
def get_random_number():
    print("request received")
    frame_hash = capture_rtsp_stream(rtsp_url)
    return jsonify({"random_number": frame_hash})

def capture_rtsp_stream(rtsp_url):
    print("in capture: ", rtsp_url)
    cap = cv2.VideoCapture(rtsp_url)

    if not cap.isOpened():
        print(f"Error: Could not open video stream with URL {rtsp_url}")
        return None

    ret, frame = cap.read()
    if not ret:
        print("Error: Failed to capture frame.")
        cap.release()
        return None

    frame_hash = process_frame(frame)

    cap.release()
    return frame_hash

def process_frame(frame):
    height, width, _ = frame.shape

    overall_hash = hashlib.sha3_256() 
    # hash the concatanetion of the pixels, then make a rolling hash basically
    for i in range(height):
        for j in range(width):
            r, g, b = frame[i, j]
            pixel = f"{r:03}{g:03}{b:03}".encode('utf-8')
            overall_hash.update(pixel)
    return overall_hash.hexdigest()

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5001)
    capture_rtsp_stream(rtsp_url)