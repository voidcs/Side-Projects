from flask import Flask, jsonify, request
import subprocess
import os

app = Flask(__name__)

# Paths to executables and input file
BASE_PATH = os.path.join(os.path.dirname(__file__), 'prefix_sum')
PARALLEL_EXECUTABLE = os.path.join(BASE_PATH, 'prefix_sum_parallel')
SEQUENTIAL_EXECUTABLE = os.path.join(BASE_PATH, 'prefix_sum_sequential')
INPUT_FILE = os.path.join(BASE_PATH, 'prefix_sum_input.txt')

def run_executable(executable):
    try:
        # Run the executable and capture the output
        result = subprocess.run(executable, capture_output=True, text=True, check=True)
        output = result.stdout.strip()
        return output
    except subprocess.CalledProcessError as e:
        return f"An error occurred: {e}"

@app.route('/run_prefix_sum', methods=['POST'])
def run_prefix_sum():
    # Ensure the input file is in the correct directory
    if not os.path.isfile(INPUT_FILE):
        return jsonify({"error": "Input file not found"}), 400

    # Run the sequential version
    sequential_output = run_executable(SEQUENTIAL_EXECUTABLE)
    if "An error occurred" in sequential_output:
        return jsonify({"error": sequential_output}), 500

    # Run the parallel version
    parallel_output = run_executable(PARALLEL_EXECUTABLE)
    if "An error occurred" in parallel_output):
        return jsonify({"error": parallel_output}), 500

    return jsonify({
        "sequential_execution_time": sequential_output,
        "parallel_execution_time": parallel_output
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
