import AhoCorasick from "aho-corasick.js";

class ExtendedAhoCorasick extends AhoCorasick {
  constructor(keywords) {
    super(keywords);
  }

  /**
   * Check if a given string is a prefix of any keyword in the automaton
   * @param {string} prefix - The prefix to check
   * @returns {boolean} - True if the prefix exists, otherwise false
   */
  hasPrefix(prefix) {
    let currentState = this.root;

    for (let char of prefix) {
      const nextState = currentState.children[char];

      if (!nextState) {
        return false; // No node for this character means no such prefix
      }

      currentState = nextState;
    }

    return true; // Successfully traversed all characters of the prefix
  }
}

export default ExtendedAhoCorasick;
