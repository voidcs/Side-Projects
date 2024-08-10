import java.io.*;
import java.util.*;
import java.util.concurrent.RecursiveTask;
import java.util.concurrent.ForkJoinPool;
import java.util.concurrent.TimeUnit;


public class ForkJoinParallel {

    static class PrefixSumTask extends RecursiveTask<long[]> {
        private static final int SEQUENTIAL_THRESHOLD = 5000;
        private final int[] input;
        private final int start;
        private final int end;

        public PrefixSumTask(int[] input, int start, int end) {
            this.input = input;
            this.start = start;
            this.end = end;
        }

        @Override
        protected long[] compute() {
            if (end - start <= SEQUENTIAL_THRESHOLD) {
                return computeSequentially();
            } else {
                int mid = start + (end - start) / 2;
                PrefixSumTask leftTask = new PrefixSumTask(input, start, mid);
                PrefixSumTask rightTask = new PrefixSumTask(input, mid, end);

                leftTask.fork();
                long[] rightResult = rightTask.compute();
                long[] leftResult = leftTask.join();

                long[] result = new long[end - start];
                System.arraycopy(leftResult, 0, result, 0, mid - start);
                for (int i = mid; i < end; i++) {
                    result[i - start] = rightResult[i - mid] + leftResult[mid - start - 1];
                }
                return result;
            }
        }

        private long[] computeSequentially() {
            long[] result = new long[end - start];
            result[0] = input[start];
            for (int i = start + 1; i < end; i++) {
                result[i - start] = result[i - start - 1] + input[i];
            }
            return result;
        }
    }

    public static long[] prefixSum(int[] input) {
        ForkJoinPool pool = new ForkJoinPool();
        PrefixSumTask task = new PrefixSumTask(input, 0, input.length);
        long[] result = pool.invoke(task);
        pool.shutdown();

        long[] finalResult = new long[input.length + 1];
        System.arraycopy(result, 0, finalResult, 1, result.length);
        return finalResult;
    }

    public static void main(String[] args) {
        try {
            BufferedReader br = new BufferedReader(new FileReader("giant_input.txt"));
            int n = Integer.parseInt(br.readLine().trim());
            int[] v = Arrays.stream(br.readLine().trim().split("\\s+")).mapToInt(Integer::parseInt).toArray();
            br.close();

            long start = System.nanoTime();
            long[] result = prefixSum(v);
            long end = System.nanoTime();

            long duration = TimeUnit.NANOSECONDS.toMillis(end - start);
            System.out.printf("%.2f ms%n", (double) duration);

            // Uncomment to print the result (for debugging)
            // System.out.println("Expected output: 0 9 19 27 28 34 38 41 43 53 61");
            System.out.print("Computed output: ");
            // for (long value : result) {
            //     System.out.print(value + " ");
            // }
            // System.out.println();

        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
