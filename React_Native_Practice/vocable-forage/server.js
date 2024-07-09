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
const AWS = require("aws-sdk");
const bcrypt = require("bcrypt");

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

const dynamoDB = new AWS.DynamoDB.DocumentClient({
  region: "us-east-2",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
const USER_TABLE_NAME = "vocable-forage-userdata";
const GAME_TABLE_NAME = "vocable-forage-gamedata";

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

app.post("/attemptLogin", async (req, res) => {
  const { username, password } = req.body;

  const validUsernameRegex = /^[a-zA-Z0-9_-💀]{3,24}$/;
  if (!validUsernameRegex.test(username)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid characters in username" });
  }

  const normalizedUsername = username.toLowerCase();

  const queryParams = {
    TableName: USER_TABLE_NAME,
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": normalizedUsername,
    },
  };

  try {
    const userResult = await dynamoDB.query(queryParams).promise();

    if (userResult.Items.length === 0) {
      // If user does not exist, return an error
      return res
        .status(404)
        .json({ success: false, message: "Username does not exist." });
    }

    const user = userResult.Items[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect password." });
    }

    // Return user data if login is successful
    res.status(200).json({
      success: true,
      user: {
        username: user.username,
        friends: user.friends,
        gameIds: user.gameIds,
      },
    });
  } catch (error) {
    console.error("Error in attempting login:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

app.post("/getUser", async (req, res) => {
  const { username } = req.body;

  const validUsernameRegex = /^[a-zA-Z0-9_-💀]{3,24}$/;
  if (!validUsernameRegex.test(username)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid characters in username" });
  }

  const normalizedUsername = username.toLowerCase();

  const queryParams = {
    TableName: USER_TABLE_NAME,
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": normalizedUsername,
    },
  };

  try {
    const userResult = await dynamoDB.query(queryParams).promise();

    if (userResult.Items.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Username does not exist." });
    }

    const user = userResult.Items[0];
    res.status(200).json({
      success: true,
      user: {
        username: user.username,
        friends: user.friends,
        gameIds: user.gameIds,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

app.post("/createAccount", async (req, res) => {
  const { username, password } = req.body;
  const validUsernameRegex = /^[a-zA-Z0-9_-💀]{3,24}$/;
  if (!validUsernameRegex.test(username)) {
    return res
      .status(400)
      .json({ success: false, message: "Make a valid username idiot" });
  }
  const normalizedUsername = username.toLowerCase();

  const queryParams = {
    TableName: USER_TABLE_NAME,
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": normalizedUsername,
    },
  };

  try {
    const existingUser = await dynamoDB.query(queryParams).promise();
    if (existingUser.Items.length > 0) {
      // If user exists, return an error
      return res.status(409).json({
        success: false,
        message: "Username already exists.",
      });
    }
    const userId = normalizedUsername; // This can be any unique identifier. Here, we are using the username for simplicity.
    const hashedPassword = await bcrypt.hash(password, 10);

    const params = {
      TableName: USER_TABLE_NAME,
      Item: {
        userId, // Partition key
        dataType: "userAccount", // Sort key, using 'userAccount' as a constant value for account data
        username: normalizedUsername, // Additional attributes
        password: hashedPassword,
        friends: [],
        gameIds: [],
      },
    };
    await dynamoDB.put(params).promise();
    res.status(200).json({
      success: true,
      message: "Account created successfully",
      user: {
        username: username,
        friends: [],
        gameIds: [],
      },
    });
  } catch (error) {
    console.error("Error in creating account:", error);

    // Return false to indicate failure
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post("/addFriend", async (req, res) => {
  const { username, friendname } = req.body;

  console.log("in add friend", username, friendname);

  const validUsernameRegex = /^[a-zA-Z0-9_-💀]{3,24}$/;
  if (!validUsernameRegex.test(friendname)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid characters in username" });
  }

  if (
    validUsernameRegex.test(friendname) &&
    friendname.toLowerCase() === username
  ) {
    return res
      .status(400)
      .json({ success: false, message: "You cannot add yourself as a friend" });
  }
  const normalizedFriendName = friendname.toLowerCase();

  const getParams = {
    TableName: USER_TABLE_NAME,
    Key: {
      userId: username.toLowerCase(),
      dataType: "userAccount",
    },
  };

  try {
    const user = await dynamoDB.get(getParams).promise();
    if (!user.Item) {
      console.log("User does not exist");
      return res
        .status(404)
        .json({ success: false, message: "User does not exist." });
    }

    // Check if the friend is already added
    if (user.Item.friends && user.Item.friends.includes(normalizedFriendName)) {
      return res.status(409).json({
        success: false,
        message: "Friend already added.",
      });
    }

    const updateParams = {
      TableName: USER_TABLE_NAME,
      Key: {
        userId: username,
        dataType: "userAccount",
      },
      UpdateExpression:
        "SET friends = list_append(if_not_exists(friends, :empty_list), :friend)",
      ExpressionAttributeValues: {
        ":friend": [normalizedFriendName],
        ":empty_list": [],
      },
      ReturnValues: "UPDATED_NEW",
    };

    await dynamoDB.update(updateParams).promise();
    console.log("Friend added successfully");
    res.status(200).json({
      success: true,
      message: "Friend added successfully",
    });
  } catch (error) {
    console.error("Error searching for user", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/getPlayerGames", async (req, res) => {
  const { username, gameIds } = req.body;
  // console.log("IN THE SERVER username: ", username, "gameIds: ", gameIds);

  if (!username || !gameIds || !Array.isArray(gameIds)) {
    return res
      .status(400)
      .json({ success: false, message: "Username and gameIds are required" });
  }

  const results = [];

  for (const [gameId, hasPlayed] of gameIds) {
    const queryParams = {
      TableName: GAME_TABLE_NAME,
      Key: {
        gameId: gameId,
      },
    };

    try {
      const gameResult = await dynamoDB.get(queryParams).promise();

      if (!gameResult.Item) {
        console.log(`Game not found for gameId: ${gameId}`);
        continue;
      }

      const player = gameResult.Item.players.find(
        (player) => player.username === username
      );

      if (!player) {
        console.log(`Player not found in gameId: ${gameId}`);
        continue;
      }
      // console.log("player: ", gameResult.Item);
      const formattedDate = new Date(player.dateAndTimePlayedAt).toLocaleString(
        "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        }
      );
      results.push({
        gameId: gameId,
        dateAndTimePlayedAt: formattedDate,
        hasPlayed: hasPlayed,
        wordsFoundForThisPlay: player.wordsFoundForThisPlay,
        boardLength: gameResult.Item.board.length,
      });
    } catch (error) {
      console.error(`Error fetching player in gameId: ${gameId}`, error);
    }
  }

  // console.log("results:", results);
  res.status(200).json({ success: true, games: results });
});

app.post("/createGame", async (req, res) => {
  const { gameId, allWords, board, wordsPerCell } = req.body;
  console.log("Creating game with ID: ", gameId);

  if (!gameId || !allWords || !board) {
    return res.status(400).json({
      success: false,
      message: "gameId, allWords, and board are required",
    });
  }

  const params = {
    TableName: GAME_TABLE_NAME,
    Item: {
      gameId: gameId,
      allWords: allWords,
      wordsPerCell: wordsPerCell,
      board: board,
      players: [],
    },
  };
  console.log("gameId: ", gameId);
  console.log("allWords: ", allWords);
  console.log("board: ", board);
  console.log("wordsPerCell: ", wordsPerCell);
  try {
    await dynamoDB.put(params).promise();
    console.log(`Game created successfully with ID: ${gameId}`);
    res
      .status(200)
      .json({ success: true, message: "Game created successfully" });
  } catch (error) {
    console.error("Error creating game:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/addPlayerToGame", async (req, res) => {
  const { gameId, username, wordsFoundForThisPlay } = req.body;

  console.log("gameId: ", gameId);
  console.log("username: ", username);
  console.log("words: ", wordsFoundForThisPlay);
  if (!gameId || !username || !wordsFoundForThisPlay) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  function convertToPST(date) {
    const utcOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
    const utcDate = date.getTime() + utcOffset; // UTC time
    const pstOffset = -7 * 3600000; // PST is UTC-8:00
    const pstDate = new Date(utcDate + pstOffset); // apply PST offset
    return pstDate.toISOString();
  }
  const player = {
    username,
    wordsFoundForThisPlay,
    dateAndTimePlayedAt: convertToPST(new Date()),
    hasPlayed: true,
  };
  console.log("time: ", player.dateAndTimePlayedAt);

  const params = {
    TableName: GAME_TABLE_NAME,
    Key: {
      gameId: gameId,
    },
    UpdateExpression:
      "SET players = list_append(if_not_exists(players, :empty_list), :player)",
    ExpressionAttributeValues: {
      ":player": [player],
      ":empty_list": [],
    },
    ReturnValues: "UPDATED_NEW",
  };

  try {
    const result = await dynamoDB.update(params).promise();
    res.status(200).json({
      success: true,
      message: "Player added successfully",
      updatedAttributes: result.Attributes,
    });
  } catch (error) {
    console.error("Error adding player to game:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/addGameToPlayer", async (req, res) => {
  const { gameId, username, hasPlayed } = req.body;

  console.log("gameId: ", gameId);
  console.log("username: ", username);
  console.log("hasPlayed: ", hasPlayed);
  if (!gameId || !username) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  // Construct the new gameId pair
  const gameIdPair = [gameId, hasPlayed];

  const updateParams = {
    TableName: USER_TABLE_NAME,
    Key: {
      userId: username,
      dataType: "userAccount",
    },
    UpdateExpression:
      "SET gameIds = list_append(if_not_exists(gameIds, :empty_list), :gameIdPair)",
    ExpressionAttributeValues: {
      ":gameIdPair": [gameIdPair],
      ":empty_list": [],
    },
    ReturnValues: "UPDATED_NEW",
  };

  try {
    const getParams = {
      TableName: USER_TABLE_NAME,
      Key: {
        userId: username,
        dataType: "userAccount",
      },
    };

    const getResult = await dynamoDB.get(getParams).promise();
    const currentGameIds = getResult.Item ? getResult.Item.gameIds : [];

    // Check if gameId already exists
    if (currentGameIds.some((pair) => pair[0] === gameId)) {
      return res.status(409).json({
        success: false,
        message: "Player is already in this game",
      });
    }
    const updateResult = await dynamoDB.update(updateParams).promise();
    res.status(200).json({
      success: true,
      message: "Game added to player successfully",
      updatedAttributes: updateResult.Attributes,
    });
  } catch (error) {
    console.error("Error adding game to player:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/getGameData", async (req, res) => {
  const { gameId } = req.body;
  console.log("GAMEID in server: ", gameId);
  if (!gameId) {
    return res
      .status(400)
      .json({ success: false, message: "gameId is required" });
  }
  console.log("made it just before params");
  const params = {
    TableName: GAME_TABLE_NAME,
    Key: {
      gameId: gameId,
    },
  };

  try {
    const gameData = await dynamoDB.get(params).promise();
    console.log("after db request");
    // console.log(gameData);
    if (!gameData || !gameData.Item) {
      console.log(`No game found for gameId: ${gameId}`);
      return res
        .status(200)
        .json({ success: false, message: "No game found for this gameId" });
    }

    res.status(200).json({ success: true, gameData: gameData.Item });
  } catch (error) {
    console.error("Error fetching game data:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

app.post("/getGameById", async (req, res) => {
  const { gameId } = req.body;
  console.log("in server: ", gameId);
  if (!gameId) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required field: gameId" });
  }

  const getParams = {
    TableName: GAME_TABLE_NAME,
    Key: {
      gameId: gameId,
    },
  };

  try {
    const data = await dynamoDB.get(getParams).promise();
    if (!data.Item) {
      return res
        .status(404)
        .json({ success: false, message: "Game not found" });
    }

    res.status(200).json({
      success: true,
      data: data.Item,
    });
  } catch (error) {
    console.error("Error fetching game:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
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
    console.log(
      `Server is running on http://ec2-3-145-75-212.us-east-2.compute.amazonaws.com:${port}`
    );
  });
});
