#include <iostream>
#include <vector>
#include <cmath> // for std::ceil and std::log2
#include <chrono>
#include <omp.h>
#include <iomanip> // for std::fixed and std::setprecision
using namespace std;
typedef long long ll;
typedef long double ld;
const ll INF = 1e18;
const ll mod = 1e9 + 7;

vector<int> prefix_sum(vector<int> a)
{
    int n = a.size();
    if (n == 1)
    {
        return {a[0]};
    }
    if (n % 2)
    {
        a.push_back(0);
    }
    int m = (n + 1) / 2;
    vector<int> b(m);
#pragma omp parallel for
    for (int i = 0; i < m; i++)
    {
        b[i] = a[2 * i] + a[2 * i + 1];
    }
    vector<int> c = prefix_sum(b);
    vector<int> res(a.size());
#pragma omp parallel for
    for (int i = 0; i < a.size(); i++)
    {
        if (i % 2 == 0)
        {
            res[i] = c[i / 2] - a[i + 1];
        }
        else
        {
            res[i] = c[i / 2];
        }
    }
    if (n != a.size())
    {
        res.pop_back();
    }
    return res;
}

int main()
{
    freopen("prefix_sum_giant_input.txt", "r", stdin);
    int n;
    cin >> n;
    vector<int> v(n);
    for (int &x : v)
    {
        cin >> x;
    }
    auto start = chrono::high_resolution_clock::now();
    vector<int> p = {0};
    for (int x : prefix_sum(v))
    {
        p.push_back(x);
    }

    auto end = chrono::high_resolution_clock::now();

    chrono::duration<double, milli> duration = end - start;
    // This is the correct answer for small input
    // cout << "0 9 19 27 28 34 38 41 43 53 61\n";
    // for (int i = 0; i <= n; i++)
    // {
    //     cout << p[i] << " ";
    // }
    // cout << "\n";

    cout << fixed << setprecision(2) << duration.count() << " ms\n";
    return 0;
}
