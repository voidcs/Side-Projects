#include <iostream>
#include <vector>
#include <cmath>
#include <chrono>
#include <omp.h>
#include <iomanip>

using namespace std;
typedef long long ll;

// Blelloch scan algorithm
// don't forget to pad with zeros
vector<long long> parallel_prefix_sum(const vector<int> &input)
{
    int n = input.size();
    int m = pow(2, ceil(log2(n)));
    vector<long long> prefix_sum(m, 0);

#pragma omp parallel for
    for (int i = 0; i < n; ++i)
    {
        prefix_sum[i] = input[i];
    }

    // Up-sweep (reduction) phase
    for (int d = 0; (1 << d) < m; ++d)
    {
        int stride = 1 << (d + 1);
#pragma omp parallel for
        for (int i = stride - 1; i < m; i += stride)
        {
            if (i - (stride >> 1) >= 0)
            {
                prefix_sum[i] += prefix_sum[i - (stride >> 1)];
            }
        }
    }

    // Down-sweep phase
    prefix_sum[m - 1] = 0;
    for (int d = (int)log2(m) - 1; d >= 0; --d)
    {
        int stride = 1 << (d + 1);
#pragma omp parallel for
        for (int i = stride - 1; i < m; i += stride)
        {
            if (i - (stride >> 1) >= 0)
            {
                int t = prefix_sum[i - (stride >> 1)];
                prefix_sum[i - (stride >> 1)] = prefix_sum[i];
                prefix_sum[i] += t;
            }
        }
    }
    prefix_sum.resize(n + 1);

    return prefix_sum;
}

int main()
{
    freopen("small_input.txt", "r", stdin);
    int n;
    cin >> n;
    vector<int> v(n);
    for (int &x : v)
    {
        cin >> x;
    }

    auto start = chrono::high_resolution_clock::now();
    vector<long long> p = parallel_prefix_sum(v);
    auto end = chrono::high_resolution_clock::now();

    chrono::duration<double, milli> duration = end - start;
    cout << fixed << setprecision(2) << duration.count() << " ms\n";

    // This is the correct answer for small input
    // cout << "Expected output: 0 9 19 27 28 34 38 41 43 53 61\n";
    // cout << "Computed output: ";
    // for (int i = 0; i <= n; ++i)
    // {
    //     cout << p[i] << " ";
    // }
    // cout << "\n";

    return 0;
}
