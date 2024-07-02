const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const AhoCorasick = require("aho-corasick");
const Trie = require("trie-prefix-tree");
require("dotenv").config();

const app = express();
const port = 3000;

let trie;

app.use(express.json());
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

// I tried this but the request is just too slow to use during gameplay
app.post("/containsPrefix", (req, res) => {
  const { query } = req.body;
  if (!trie) {
    return res.status(500).json({ error: "Trie not ready" });
  }
  const result = trie.hasWord(query);
  res.json({ result });
});

app.post("/createAccount", async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const params = {
      TableName: TABLE_NAME,
      Item: {
        username,
        password: hashedPassword,
        friends: [],
        gameIds: [],
      },
    };

    await dynamoDB.put(params).promise();

    res.status(200).json({ message: "Account created successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
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

buildTrie().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on http://18.222.167.11:${port}`);
  });
});
