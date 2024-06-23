declare module 'aho-corasick.js' {
    class AhoCorasick {
      constructor(words: string[]);
      search(text: string): Array<{ keyword: string, index: number }>;
    }
  
    export = AhoCorasick;
  }
  