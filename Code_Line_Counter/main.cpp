#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
const ll mod = 1e9+7;
const ll INF = 1e18;

int main(){
    freopen("input1.txt", "r", stdin); 
    string s;
    int nonComment = 0, comment = 0, total = 0, emptyLine = 0;
    while(getline(cin, s)){
        bool first = 1;
        bool isComment = 0;
        int blank = 0;
        for(int i = 0; i < s.length(); i++){
            if(isspace(s[i])){
                blank++;
                continue;
            }
            if(i && s[i] == '/' && (s[i-1] == '/' || s[i-1] == '*'))
                isComment = 1;
            if(i && s[i] == '*' && s[i-1] == '/')
                isComment = 1;
            if(first && s[i] == '*')
                isComment = 1;
            first = 0;
        }
        total++;
        if(blank == s.length())
            emptyLine++;
        else if(isComment)
            comment++;
        else
            nonComment++;
    }
    //freopen("output.txt", "w", stdout); 
    cout<<"Total number of lines: "<<total<<endl;
    cout<<"Number of comments: "<<comment<<endl;
    cout<<"Number of regular lines: "<<nonComment<<endl;
    cout<<"Number of blank lines: "<<emptyLine<<endl;
    
    return 0;
}