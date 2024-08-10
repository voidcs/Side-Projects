#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
typedef long double ld;
const ll INF = 1e18;
const ll mod = 1e9 + 7;

int main()
{
    freopen("giant_input.txt", "r", stdin);
    int n;
    cin >> n;
    vector<long long> p(n + 1);
    vector<int> v(n);
    for (int &x : v)
    {
        cin >> x;
    }
    auto start = chrono::high_resolution_clock::now();

    for (int i = 0; i < n; i++)
    {
        p[i + 1] = p[i] + v[i];
    }
    auto end = chrono::high_resolution_clock::now();

    // Calculate duration in milliseconds as a floating-point value
    chrono::duration<double, std::milli> duration = end - start;
    // for (int x : p)
    // {
    //     cout << x << " ";
    // }
    // cout << "\n";
    cout << fixed << setprecision(2) << duration.count() << " ms\n";
}
