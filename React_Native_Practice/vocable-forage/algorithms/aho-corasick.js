// aho-corasick.js
class AhoCorasickNode {
  constructor() {
    this.children = {};
    this.fail = null;
    this.output = [];
  }
}

class AhoCorasick {
  constructor(words) {
    this.root = new AhoCorasickNode();
    this.buildTrie(words);
    this.buildFailLinks();
  }

  buildTrie(words) {
    for (const word of words) {
      let node = this.root;
      for (const char of word) {
        if (!node.children[char]) {
          node.children[char] = new AhoCorasickNode();
        }
        node = node.children[char];
      }
      node.output.push(word);
    }
  }

  buildFailLinks() {
    const queue = [];
    for (const node of Object.values(this.root.children)) {
      node.fail = this.root;
      queue.push(node);
    }

    while (queue.length) {
      const current = queue.shift();

      for (const [char, child] of Object.entries(current.children)) {
        let fail = current.fail;
        while (fail && !fail.children[char]) {
          fail = fail.fail;
        }
        child.fail = fail ? fail.children[char] : this.root;
        child.output = child.output.concat(child.fail.output);
        queue.push(child);
      }
    }
  }

  search(text) {
    let node = this.root;
    const results = [];

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      while (node && !node.children[char]) {
        node = node.fail;
      }
      if (node) {
        node = node.children[char];
        if (node.output.length) {
          results.push({ index: i, outputs: node.output });
        }
      } else {
        node = this.root;
      }
    }

    return results;
  }
}

module.exports = AhoCorasick;
