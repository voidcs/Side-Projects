import math
import time

def serial_prefix_sum(input_data):
    n = len(input_data)
    m = 2 ** math.ceil(math.log2(n))
    prefix_sum = [0] * m

    # Copy input to prefix_sum
    for i in range(n):
        prefix_sum[i] = input_data[i]

    # Up-sweep (reduction) phase
    d = 0
    while (1 << d) < m:
        stride = 1 << (d + 1)
        for i in range(stride - 1, m, stride):
            prefix_sum[i] += prefix_sum[i - (stride >> 1)]
        d += 1

    # Down-sweep phase
    prefix_sum[m - 1] = 0
    d -= 1
    while d >= 0:
        stride = 1 << (d + 1)
        for i in range(stride - 1, m, stride):
            t = prefix_sum[i - (stride >> 1)]
            prefix_sum[i - (stride >> 1)] = prefix_sum[i]
            prefix_sum[i] += t
        d -= 1

    return prefix_sum

def main():
    input_file = "small_input.txt"
    with open(input_file, "r") as f:
        n = int(f.readline().strip())
        data = list(map(int, f.readline().strip().split()))

    start_time = time.time()

    prefix_sum = serial_prefix_sum(data)

    end_time = time.time()

    duration = (end_time - start_time) * 1000
    print(f"{duration:.2f} ms")

    print(" ".join(map(str, prefix_sum[:n + 1])))

if __name__ == "__main__":
    main()
