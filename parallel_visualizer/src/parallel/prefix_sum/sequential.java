import java.io.*;
import java.util.*;
import java.util.concurrent.TimeUnit;

public class SequentialPrefixSum {

    public static long[] prefixSum(int[] input) {
        int n = input.length;
        int m = (int) Math.pow(2, Math.ceil(Math.log(n) / Math.log(2)));
        long[] prefixSum = new long[m];
        
        // Copy input to prefixSum
        for (int i = 0; i < n; ++i) {
            prefixSum[i] = input[i];
        }

        // Up-sweep (reduction) phase
        for (int d = 0; (1 << d) < m; ++d) {
            int stride = 1 << (d + 1);
            for (int i = stride - 1; i < m; i += stride) {
                if (i - (stride >> 1) >= 0) {
                    prefixSum[i] += prefixSum[i - (stride >> 1)];
                }
            }
        }

        // Down-sweep phase
        prefixSum[m - 1] = 0;
        for (int d = (int)(Math.log(m) / Math.log(2)) - 1; d >= 0; --d) {
            int stride = 1 << (d + 1);
            for (int i = stride - 1; i < m; i += stride) {
                if (i - (stride >> 1) >= 0) {
                    long t = prefixSum[i - (stride >> 1)];
                    prefixSum[i - (stride >> 1)] = prefixSum[i];
                    prefixSum[i] += t;
                }
            }
        }

        return Arrays.copyOf(prefixSum, n+1);
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
            // System.out.print("Computed output: ");
            // for (long value : result) {
            //     System.out.print(value + " ");
            // }
            // System.out.println();

        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
