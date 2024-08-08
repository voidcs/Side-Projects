#include <iostream>
#include <vector>
#include <cmath>
#include <chrono>
#include <omp.h>
#include <iomanip>

using namespace std;
typedef long long ll;

// Function to perform parallel prefix sum (scan) using the Blelloch scan algorithm
vector<int> parallel_prefix_sum(const vector<int> &input)
{
    int n = input.size();
    vector<int> prefix_sum(n);

// Step 1: Copy the input to prefix_sum
#pragma omp parallel for
    for (int i = 0; i < n; ++i)
    {
        prefix_sum[i] = input[i];
    }

    // Up-sweep (reduction) phase
    for (int d = 0; (1 << d) < n; ++d)
    {
        int stride = 1 << d;
#pragma omp parallel for
        for (int i = 0; i < n; i += 2 * stride)
        {
            if (i + stride < n)
            {
                prefix_sum[i + 2 * stride - 1] += prefix_sum[i + stride - 1];
            }
        }
    }

    // Down-sweep phase
    prefix_sum[n - 1] = 0;
    for (int d = (int)log2(n) - 1; d >= 0; --d)
    {
        int stride = 1 << d;
#pragma omp parallel for
        for (int i = 0; i < n; i += 2 * stride)
        {
            if (i + stride < n)
            {
                int t = prefix_sum[i + stride - 1];
                prefix_sum[i + stride - 1] = prefix_sum[i + 2 * stride - 1];
                prefix_sum[i + 2 * stride - 1] += t;
            }
        }
    }

    return prefix_sum;
}

int main()
{
    freopen("prefix_sum_large_input.txt", "r", stdin);
    int n;
    cin >> n;
    vector<int> v(n);
    for (int &x : v)
    {
        cin >> x;
    }

    auto start = chrono::high_resolution_clock::now();
    vector<int> p = parallel_prefix_sum(v);
    auto end = chrono::high_resolution_clock::now();

    chrono::duration<double, milli> duration = end - start;
    cout << fixed << setprecision(2) << duration.count() << " ms\n";

    // Uncomment to print the result (for debugging)
    // for (int i = 0; i < n; ++i) {
    //     cout << p[i] << " ";
    // }
    // cout << "\n";

    return 0;
}
