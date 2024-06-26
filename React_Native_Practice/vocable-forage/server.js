const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const Trie = require("trie-prefix-tree");
require("dotenv").config(); // Load environment variables from .env file

const app = express();
const port = 3000;

let trie;

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

async function buildTrie() {
  const bucket = "my-word-list-bucket";
  const key = "filtered-word-list.txt";
  const fileContent = await getObjectFromS3(bucket, key);
  const words = fileContent.split(/\r?\n/).filter((word) => word);
  trie = Trie(words);
  console.log("Trie built successfully");
}

app.post("/search", (req, res) => {
  const { query } = req.body;
  if (!trie) {
    return res.status(500).json({ error: "Trie not ready" });
  }
  const result = trie.hasWord(query);
  res.json({ result });
});

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

// Function to start the server
async function startServer() {
  await buildTrie(); // Build the trie before starting the server
  app.listen(port, () => {
    console.log(`Server is running on http://18.222.167.11:${port}`);
  });
}

// Start the server
startServer();
