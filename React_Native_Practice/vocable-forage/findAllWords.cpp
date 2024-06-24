#include <bits/stdc++.h>
using namespace std;

struct Node{
    vector<int> next;
    bool wordEnd;
    Node(){
        wordEnd = false;
        next = vector<int>(26, -1);
    }
};

int main() {
    ifstream file("words.txt");
    vector<string> words;
    string word;

    if (!file.is_open()) {
        cerr << "Error opening file" << endl;
        return 1;
    }

    while (file >> word) {
        words.push_back(word);
    }

    vector<Node> trie;
    trie.push_back(Node());
    auto add = [&](string s){
        int i = 0;
        for(char c: s){
            int j = c - 'A';
            if(trie[i].next[j] == -1){
                trie[i].next[j] = trie.size();
                trie.push_back(Node());
            }
            i = trie[i].next[j];
        }
        trie[i].wordEnd = true;
    };

    auto query = [&](string s){
        int i = 0;
        for(char c: s){
            int j = c - 'A';
            if(trie[i].next[j] == -1){
                return -1;
            }
            i = trie[i].next[j];
        }
        return (int)trie[i].wordEnd;
    };
    int z = 0;
    for (string w : words) {
        if(w == "POTATO"){
            cout<<"potato added\n";
        }
        add(w);
    }
    file.close();
    cout << words.size() << "\n";
    srand(time(0));

    int n = 5;
    vector<vector<int>> vis(n, vector<int>(n));
    vector<array<int, 2>> dir = {{-1, -1}, {-1, 0}, {-1, 1}, {0, -1}, {0, 1}, {1, -1}, {1, 0}, {1, 1}};
    auto valid = [&](int x, int y) { return x >= 0 && x < n && y >= 0 && y < n; };
    int ans = 0;
    vector<vector<char>> g(n, vector<char>(n));
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            char c = rand() % 26 + 'A';
            g[i][j] = c;
        }
    }
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            cout << g[i][j] << " ";
        }
        cout << "\n";
    }

    string s;
    unordered_set<string> foundWords;
    function<void(int, int)> dfs = [&](int x, int y) {
        if (s.length() > 9) {
            return;
        }
        if (query(s) == -1) {
            return;
        }
        if (query(s) == 1) {
            foundWords.insert(s);
        }
        ans++;
        for (int i = 0; i < 8; i++) {
            int nx = x + dir[i][0];
            int ny = y + dir[i][1];
            if (valid(nx, ny) && !vis[nx][ny]) {
                vis[nx][ny] = 1;
                s += g[nx][ny];
                dfs(nx, ny);
                vis[nx][ny] = 0;
                s.pop_back();
            }
        }
    };

    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            s += g[i][j];
            vis[i][j] = 1;
            dfs(i, j);
            s.pop_back();
            vis[i][j] = 0;
        }
    }
    cout << "ans: " << ans << "\n";
    cout << "Found words: " << foundWords.size() << "\n";
    for(string s: foundWords){
        cout<<s<<" ";
    }
    cout<<"\n";
    return 0;
}
