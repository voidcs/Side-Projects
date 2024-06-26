const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
require("dotenv").config(); // Load environment variables from .env file

const app = express();
const port = 3000;

app.use(cors());

const s3Client = new S3Client({
  region: "us-east-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const getObjectFromS3 = async (bucket, key) => {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  console.log("Generating signed URL...");
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  console.log("Fetching from signed URL...");
  const response = await fetch(signedUrl);
  if (!response.ok) {
    console.error("Failed to fetch from S3. Status:", response.status);
    throw new Error("Failed to fetch from S3");
  }
  console.log("Reading file content...");
  const fileContent = await response.text();
  console.log("File content length:", fileContent.length);
  return fileContent;
};

// Trie Node
class TrieNode {
  constructor() {
    this.children = {};
    this.isEndOfWord = false;
  }
}

// Trie
class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word) {
    let node = this.root;
    for (const char of word) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
    }
    node.isEndOfWord = true;
  }

  serialize() {
    const serializeNode = (node) => {
      const children = {};
      for (const [char, childNode] of Object.entries(node.children)) {
        children[char] = serializeNode(childNode);
      }
      return {
        children,
        isEndOfWord: node.isEndOfWord,
      };
    };
    return JSON.stringify(serializeNode(this.root));
  }
}

app.get("/words", async (req, res) => {
  try {
    console.log("Received request to /words");
    const bucket = "my-word-list-bucket";
    const key = "filtered-word-list.txt";
    const fileContent = await getObjectFromS3(bucket, key);
    res.send(fileContent);
  } catch (error) {
    console.error("Error fetching file", error);
    res.status(500).send("Error fetching file");
  }
});

app.get("/trie", async (req, res) => {
  try {
    console.log("Received request to /trie");
    const bucket = "my-word-list-bucket";
    const key = "filtered-word-list.txt";
    const fileContent = await getObjectFromS3(bucket, key);

    const words = fileContent.split(/\r?\n/).filter((word) => word);
    const trie = new Trie();
    words.forEach((word) => trie.insert(word));
    const serializedTrie = trie.serialize();
    console.log("Serialized Trie:", serializedTrie);
    res.send(serializedTrie);
  } catch (error) {
    console.error("Error creating trie", error);
    res.status(500).send("Error creating trie");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://18.222.167.11:${port}`);
});
