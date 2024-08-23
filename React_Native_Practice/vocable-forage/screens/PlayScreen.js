import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  PanResponder,
  Vibration,
  Animated,
  TouchableOpacity,
} from "react-native";
import Svg, { Line } from "react-native-svg";
import LETTER_DIST from "../data/letter-distribution";
import POINTS from "../data/point-distribution";
import COLORS from "../data/color";
import AhoCorasick from "aho-corasick";
import createTrie from "trie-prefix-tree";
import * as Haptics from "expo-haptics";
import { getStatusBarHeight } from "react-native-status-bar-height";
import BottomNavBar from "../components/BottomNavBar";
import LoadingScreen from "./LoadingScreen";

function PlayScreen({ navigation, route }) {
  // should be able to open a board with a data base, so you give the id
  // if the id is in the table, then we read the board in front the data base
  // otherwise we just generate it, and then add it to the database
  const gameTime = 90;
  const [timer, setTimer] = useState(gameTime);
  const marginSize = 10;

  const wordsRef = useRef([]);
  const boardLengthRef = useRef(0);
  const preferredBoardSizeRef = useRef(0);
  const bufferRef = useRef(0);
  const [resetKey, setResetKey] = useState(0);

  const [words, setWords] = useState([]);
  const [boardLength, setBoardLength] = useState(0);
  const [preferredBoardSize, setPreferredBoardSize] = useState(0);
  const [user, setUser] = useState(null);

  // console.log(trie.tree());
  const { height, width } = Dimensions.get("window");

  // Buff multiplier of 0.1 works pretty good
  const [board, setBoard] = useState([]);
  const cellLayoutsRef = useRef({});
  const boardLayoutRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const boardRef = useRef(board);
  const lastActiveRef = useRef([-1, -1]);

  const wordRef = useRef("");
  const [word, setWord] = useState("");

  const activeTilesRef = useRef([]);
  const [activeTiles, setActiveTiles] = useState([]);

  useEffect(() => {
    activeTilesRef.current = activeTiles;
  }, [activeTiles]);

  const activeTilesLocRef = useRef([]);
  const [activeTilesLoc, setActiveTilesLoc] = useState([]);

  useEffect(() => {
    activeTilesLocRef.current = activeTilesLoc;
  }, [activeTilesLoc]);

  const [validWord, setValidWord] = useState(false);
  const validWordRef = useRef(validWord);

  const [alreadyFoundWord, setAlreadyFoundWord] = useState(false);
  const alreadyFoundWordRef = useRef(alreadyFoundWord);

  const [score, setScore] = useState(0);
  const scoreRef = useRef(score);
  const updateScore = (wordLength) => {
    const pointsToAdd = POINTS[wordLength] || 0;
    setScore((prevPoints) => {
      const newScore = prevPoints + pointsToAdd;
      scoreRef.current = newScore;
      return newScore;
    });
  };

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  const [wordsFound, setWordsFound] = useState([]);
  const wordsFoundRef = useRef(wordsFound);
  const updateWordsFound = (newWord) => {
    setWordsFound((prevWordsFound) => {
      const newWordsFound = [...prevWordsFound, newWord];
      wordsFoundRef.current = newWordsFound;
      return newWordsFound;
    });
  };

  useEffect(() => {
    wordsFoundRef.current = wordsFound;
  }, [wordsFound]);

  const trieRef = useRef(createTrie([]));

  useEffect(() => {
    trieRef.current = createTrie(words);
    // aho corasick automaton, it's slower and not needed lol
    // if (!automatonRef.current) {
    //   const automaton = new AhoCorasick(words);
    //   words.forEach((word) => automaton.add(word, word));
    //   automaton.build_fail();
    //   automatonRef.current = automaton;
    // }
  }, [words]);

  const setWordHandler = (ch, tile) => {
    setWord((prevString) => {
      return prevString + ch;
    });
    setActiveTiles((prevTiles) => [...prevTiles, tile]);
    wordRef.current += ch;
  };

  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  const [wordsPerCell, setWordsPerCell] = useState(
    Array.from({ length: boardLength }, () =>
      Array.from({ length: boardLength }, () => new Set())
    )
  );
  const wordsPerCellRef = useRef(wordsPerCell);
  useEffect(() => {
    wordsPerCell.current = wordsPerCell;
  }, [wordsPerCell]);
  const [allWords, setAllWords] = useState(new Set());
  const allWordsRef = useRef(new Set());
  useEffect(() => {
    allWordsRef.current = allWords;
  }, [allWords]);

  const createGameRef = useRef(false);
  const startGameRef = useRef(false);

  useEffect(() => {
    const setup = async () => {
      const {
        boardLength: routeBoardLength,
        preferredBoardSize: routePreferredBoardSize,
        user: user,
        gameId: routeGameId,
      } = route.params;
      const fetchWordList = async () => {
        try {
          //http://172.16.102.180:3000
          const response = await fetch(
            "http://ec2-3-145-75-212.us-east-2.compute.amazonaws.com:3000/words"
          );
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const result = await response.text(); // Use response.text() to handle plain text
          const wordsArray = result.split(/\r?\n/).filter((word) => word); // Split the response into an array of words
          setWords(wordsArray);
        } catch (error) {
          console.error("Error fetching word list", error);
        }
      };
      setUser(user);
      await fetchWordList();
      console.log("gameId: ", routeGameId);
      if (user == null) {
        return;
      }
      setBoardLength(routeBoardLength);
      setPreferredBoardSize(routePreferredBoardSize);

      wordsRef.current = words;
      boardLengthRef.current = routeBoardLength;
      preferredBoardSizeRef.current = routePreferredBoardSize;
      const { height, width } = Dimensions.get("window");
      // 0.25 is decent but it seems too easy to misswipe, let's see how 0.28 works with animation
      bufferRef.current = ((height * 0.4) / routePreferredBoardSize) * 0.28;

      const getGameData = async () => {
        try {
          const response = await fetch(
            "http://ec2-3-145-75-212.us-east-2.compute.amazonaws.com:3000/getGameData",
            {
              method: "POST", // Use POST method
              headers: {
                "Content-Type": "application/json", // Set the content type to JSON
              },
              body: JSON.stringify({ gameId: routeGameId }), // Send the gameId in the request body
            }
          );
          if (!response.ok) {
            const message = `The getGameData failed or something: ${response.statusText}`;
            throw new Error(message);
          }

          const data = await response.json(); // Parse the JSON response
          if (data.success) {
            console.log(
              "PlayScreen: Game data fetched successfully with UUID: ",
              routeGameId
            );
            // console.log(data.gameData);
            startGameRef.current = true;
            boardRef.current = data.gameData.board;
            boardLengthRef.current = data.gameData.board.length;
            startGameRef.current = true;
            createGameRef.current = true;
          } else {
            const initializeWordsPerCell = Array.from(
              { length: boardLengthRef.current },
              () =>
                Array.from({ length: boardLengthRef.current }, () => new Set())
            );
            setWordsPerCell(initializeWordsPerCell);
            wordsPerCellRef.current = initializeWordsPerCell;
            const letters = [];
            for (let i = 0; i < 26; i++) {
              let letter = String.fromCharCode("A".charCodeAt(0) + i);
              for (let j = 0; j < LETTER_DIST[letter]; j++) {
                letters.push(letter);
              }
            }

            const freq = {};
            for (let i = 0; i < 26; i++) {
              let letter = String.fromCharCode("A".charCodeAt(0) + i);
              freq[letter] = 0;
            }

            const newBoard = [];
            const flatBoard = [];
            for (let i = 0; i < boardLengthRef.current; i++) {
              newBoard[i] = [];
              for (let j = 0; j < boardLengthRef.current; j++) {
                let randomIndex = Math.floor(Math.random() * letters.length);
                while (freq[letters[randomIndex]] >= 2) {
                  randomIndex = Math.floor(Math.random() * letters.length);
                }
                flatBoard.push(letters[randomIndex]);
                newBoard[i][j] = letters[randomIndex];
                freq[letters[randomIndex]]++;
              }
            }
            const shuffleArray = (array) => {
              for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
              }
            };
            shuffleArray(flatBoard);

            let index = 0;
            for (let i = 0; i < boardLengthRef.current; i++) {
              for (let j = 0; j < boardLengthRef.current; j++) {
                newBoard[i][j] = flatBoard[index++];
                // newBoard[i][j] = "💀";
              }
            }
            boardRef.current = newBoard;

            const dir = [
              [-1, -1],
              [-1, 0],
              [-1, 1],
              [0, -1],
              [0, 1],
              [1, -1],
              [1, 0],
              [1, 1],
            ];

            const valid = (x, y) =>
              x >= 0 &&
              x < boardLengthRef.current &&
              y >= 0 &&
              y < boardLengthRef.current;
            let cnt = 0;

            let curRow = -1,
              curCol = -1;
            const vis = Array.from({ length: boardLengthRef.current }, () =>
              Array(boardLengthRef.current).fill(false)
            );
            const dfs = (x, y, s) => {
              if (s.length > 9) return;
              if (!trieRef.current.isPrefix(s)) return;
              cnt++;
              if (trieRef.current.hasWord(s)) {
                allWordsRef.current.add(s);
                wordsPerCellRef.current[curRow][curCol].add(s);
              }
              for (let i = 0; i < dir.length; i++) {
                const nx = x + dir[i][0];
                const ny = y + dir[i][1];
                if (valid(nx, ny) && !vis[nx][ny]) {
                  vis[nx][ny] = true;
                  dfs(nx, ny, s + boardRef.current[nx][ny]);
                  vis[nx][ny] = false;
                }
              }
            };
            for (let i = 0; i < boardLengthRef.current; i++) {
              for (let j = 0; j < boardLengthRef.current; j++) {
                let s = boardRef.current[i][j];
                vis[i][j] = true;
                (curRow = i), (curCol = j);
                dfs(i, j, s);
                vis[i][j] = false;
              }
            }
            startGameRef.current = true;
            createGameRef.current = true;
            // console.log("allWords: ", allWordsRef.current);
            const createGame = async () => {
              try {
                const response = await fetch(
                  "http://ec2-3-145-75-212.us-east-2.compute.amazonaws.com:3000/createGame",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      gameId: routeGameId,
                      allWords: Array.from(allWordsRef.current),
                      board: boardRef.current,
                      wordsPerCell: wordsPerCellRef.current.map((row) =>
                        row.map((cell) => Array.from(cell))
                      ),
                    }),
                  }
                );

                const data = await response.json();

                if (!response.ok) {
                  throw new Error(data.message || "Failed to create game");
                }

                if (data.success) {
                  // Handle success (e.g., navigate to the game screen)
                } else {
                  console.log("Failed to create game: ", data.message);
                  // Handle failure
                }
              } catch (error) {
                console.error("Error creating game: ", error.message);
              }
            };
            createGame();
          }
        } catch (error) {
          console.error("Caught error", error.message);
        }
      };
      getGameData();
    };
    setup();
  }, [route.params]);

  useEffect(() => {
    if (timer > 0) {
      const intervalId = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);

      return () => clearInterval(intervalId);
    } else {
      const { user, gameId: routeGameId } = route.params;
      const addPlayerToGame = async () => {
        try {
          const response = await fetch(
            "http://ec2-3-145-75-212.us-east-2.compute.amazonaws.com:3000/addPlayerToGame",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                gameId: routeGameId,
                username: user.username,
                wordsFoundForThisPlay: wordsFoundRef.current,
              }),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Failed to add player to game");
          }

          if (data.success) {
            console.log("Player added successfully", data.updatedAttributes);
          } else {
            console.log("Failed to add player to game: ", data.message);
          }
        } catch (error) {
          console.error("Error adding player to game: ", error.message);
        }
      };
      addPlayerToGame();

      const addGameToPlayer = async () => {
        try {
          const response = await fetch(
            "http://ec2-3-145-75-212.us-east-2.compute.amazonaws.com:3000/addGameToPlayer",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                gameId: routeGameId,
                username: user.username,
                hasPlayed: true,
              }),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Failed to add game to player");
          }

          if (data.success) {
            console.log("Game added to player successfully");
            navigation.replace("EndGameScreen", {
              preferredBoardSize: preferredBoardSize,
              user: user,
              gameId: routeGameId,
            });
          } else {
            console.log("Failed to add game to player: ", data.message);
          }
        } catch (error) {
          console.error("Error adding game to player: ", error.message);
        }
      };
      addGameToPlayer();
    }
  }, [timer, navigation]);
  function navigateHandler() {
    const { user: user, gameId: routeGameId } = route.params;
    const addPlayerToGame = async () => {
      try {
        const response = await fetch(
          "http://ec2-3-145-75-212.us-east-2.compute.amazonaws.com:3000/addPlayerToGame",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              gameId: routeGameId,
              username: user.username,
              wordsFoundForThisPlay: wordsFoundRef.current,
              inviter: "",
              hasPlayed: true,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to add player to game");
        }

        if (data.success) {
          console.log("Player added successfully", data.updatedAttributes);
        } else {
          console.log("Failed to add player to game: ", data.message);
        }
      } catch (error) {
        console.error("Error adding player to game: ", error.message);
      }
    };
    addPlayerToGame(); // The player is added in the game, now we add the game to the player

    const addGameToPlayer = async () => {
      try {
        const response = await fetch(
          "http://ec2-3-145-75-212.us-east-2.compute.amazonaws.com:3000/addGameToPlayer",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              gameId: routeGameId,
              username: user.username,
              hasPlayed: true,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to add game to player");
        }

        if (data.success) {
          console.log("Game added to player successfully, going to replace");
          navigation.replace("EndGameScreen", {
            preferredBoardSize: preferredBoardSize,
            user: user,
            gameId: routeGameId,
          });
        } else {
          console.log("Failed to add game to player: ", data.message);
        }
      } catch (error) {
        console.error("Error adding game to player: ", error.message);
      }
    };
    addGameToPlayer();
  }

  // This is the code to make a board, only need to do it if the createBoard is true

  const onLayoutBoard = (event) => {
    const board = event.target;
    requestAnimationFrame(() => {
      setTimeout(() => {
        board.measure((x, y, width, height, pageX, pageY) => {
          boardLayoutRef.current = { x: pageX, y: pageY, width, height };
        });
      }, 0);
    });
  };
  let cnt = 0;

  const onLayoutCell = (event, rowIndex, cellIndex) => {
    const key = `${rowIndex}-${cellIndex}`;
    const cell = event.target;

    cell.measure((x, y, width, height, pageX, pageY) => {
      const boardX = boardLayoutRef.current.x;
      const boardY = boardLayoutRef.current.y;
      cellLayoutsRef.current[key] = {
        x: pageX,
        y: pageY,
        width,
        height,
      };
      cnt++;
    });
  };

  const getCellLayout = (rowIndex, cellIndex) => {
    const key = `${rowIndex}-${cellIndex}`;
    return cellLayoutsRef.current[key];
  };

  const findCell = (touchX, touchY) => {
    for (let x = 0; x < boardLengthRef.current; x++) {
      for (let y = 0; y < boardLengthRef.current; y++) {
        let layout = getCellLayout(x, y);
        // console.log(
        //   "touchX: ",
        //   touchX,
        //   " touchY: ",
        //   touchY,
        //   " buffer: ",
        //   buffer
        // );
        if (layout) {
          if (
            touchY >= layout.y - marginSize &&
            touchY <= layout.y + layout.height + marginSize
          ) {
            // If we're in the long strip of the plus
            if (
              touchY >= layout.y + bufferRef.current &&
              touchY <= layout.y + layout.height - bufferRef.current
            ) {
              if (
                touchX >= layout.x - marginSize &&
                touchX <= layout.x + layout.width + marginSize
              ) {
                return { x, y };
              }
            } else {
              if (
                touchX >= layout.x + bufferRef.current &&
                touchX <= layout.x + layout.width - bufferRef.current
              ) {
                return { x, y };
              }
            }
          }
        }
      }
    }
    return -1;
  };

  const updateActiveTilesLoc = (a, b) => {
    let layout = getCellLayout(a, b);
    if (layout) {
      const newActiveTilesLoc = [
        ...activeTilesLocRef.current,
        { x: layout.x + layout.width / 2, y: layout.y + layout.height / 2 },
      ];
      setActiveTilesLoc(newActiveTilesLoc);
      activeTilesLocRef.current = newActiveTilesLoc;
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (e, gestureState) => {
        const touchX = e.nativeEvent.pageX;
        const touchY = e.nativeEvent.pageY;
        const cell = findCell(touchX, touchY);
        if (cell === -1) {
          return;
        }
        const { x, y } = cell;
        lastActiveRef.current = [x, y];
        setWordHandler(boardRef.current[x][y], { x, y });
        updateActiveTilesLoc(x, y);
        // console.log(activeTilesLocRef.current);
      },
      onPanResponderMove: (e, gestureState) => {
        const touchX = e.nativeEvent.pageX;
        const touchY = e.nativeEvent.pageY;

        const cell = findCell(touchX, touchY);
        if (cell === -1) {
          return;
        }
        const { x, y } = cell;

        if (x === lastActiveRef.current[0] && y === lastActiveRef.current[1]) {
          return;
        }
        if (
          activeTilesRef.current.some((tile) => tile.x === x && tile.y === y)
        ) {
          return;
        }
        if (activeTilesRef.current.length === 0) {
          lastActiveRef.current = [x, y];
          setWordHandler(boardRef.current[x][y], { x, y });
          updateActiveTilesLoc(x, y);
          return;
        }
        let dist = Math.sqrt(
          Math.abs(lastActiveRef.current[0] - x) ** 2 +
            Math.abs(lastActiveRef.current[1] - y) ** 2
        );

        if (dist < 2) {
          setWordHandler(boardRef.current[x][y], { x, y });
          updateActiveTilesLoc(x, y);
          lastActiveRef.current = [x, y];
        }
        // console.log("current locs: ", activeTilesLocRef.current);
        let found = trieRef.current.hasWord(wordRef.current.toLowerCase());
        // automatonRef.current.search(wordRef.current, (word, data, offset) => {
        //   if (word === wordRef.current) {
        //     found = true;
        //   }
        // });

        if (found) {
          if (!wordsFoundRef.current.includes(wordRef.current)) {
            setAlreadyFoundWord(false);
            alreadyFoundWordRef.current = false;
            setValidWord(true);
            validWordRef.current = true;
            // Vibration.vibrate(10000);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          } else {
            setAlreadyFoundWord(true);
            alreadyFoundWordRef.current = true;
          }
        } else {
          setAlreadyFoundWord(false);
          alreadyFoundWordRef.current = false;
          setValidWord(false);
          validWordRef.current = false;
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        if (
          validWordRef.current &&
          wordRef.current.length > 0 &&
          !wordsFoundRef.current.includes(wordRef.current)
        ) {
          updateWordsFound(wordRef.current);
          updateScore(wordRef.current.length);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }

        // Reset everything when we let go
        let timeoutAmount = validWordRef.current ? 30 : 0;
        setTimeout(() => {
          // Reset everything after 0.2 seconds
          setWord("");
          wordRef.current = "";
          lastActiveRef.current = [-1, -1];
          setActiveTiles([]);
          setValidWord(false);
          validWordRef.current = false;
          setAlreadyFoundWord(false);
          alreadyFoundWordRef.current = false;
          setActiveTilesLoc([]);
          activeTilesLocRef.current = [];
          setResetKey((prevKey) => prevKey + 1);
        }, timeoutAmount); // 200 milliseconds delay
      },
    })
  ).current;
  const styles = createStyles(
    boardLengthRef.current,
    height,
    width,
    marginSize
  );
  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  if (!user) {
    return (
      <View style={styles.noUserContainer}>
        <Text style={styles.noUserInfoText}>
          Create an account to start playing.
        </Text>
        <TouchableOpacity
          onPress={() =>
            navigation.replace("ProfileScreen", {
              preferredBoardSize: preferredBoardSize,
              user: null,
            })
          } // Adjust the screen name if different
        >
          <Text style={styles.noUserLinkText}>Create an account</Text>
        </TouchableOpacity>
        <View style={styles.noUserNavContainer}>
          <BottomNavBar
            navigation={navigation}
            preferredBoardSize={preferredBoardSize}
            user={user}
          />
        </View>
      </View>
    );
  }
  if (boardRef.current.length == 0) {
    return (
      <View style={styles.container}>
        <LoadingScreen />

        <View style={styles.navContainer}>
          <BottomNavBar
            navigation={navigation}
            preferredBoardSize={preferredBoardSize}
            user={user}
          />
        </View>
      </View>
    );
  }

  return boardRef.current.length > 0 ? (
    <View style={styles.background}>
      <Svg
        style={styles.svgOverlay}
        height={height}
        width={width}
        viewBox={`0 0 ${width} ${height}`}
      >
        {activeTiles.Ref != [] &&
          activeTilesLocRef.current.map((point, index) => {
            if (index < activeTilesLocRef.current.length - 1) {
              const nextPoint = activeTilesLocRef.current[index + 1];
              return (
                <Line
                  key={index}
                  x1={point.x}
                  y1={point.y}
                  x2={nextPoint.x}
                  y2={nextPoint.y}
                  stroke={validWordRef.current ? COLORS.Accent : COLORS.Light}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeOpacity={validWordRef.current ? "1" : "0.5"}
                />
              );
            }
            return null;
          })}
      </Svg>
      <View style={[styles.scoreContainer]}>
        <Text style={styles.scoreText}>Score: {scoreRef.current}</Text>
        <Text style={styles.scoreWordsText}>
          Words: {wordsFoundRef.current.length}
        </Text>
        <TouchableOpacity onPress={navigateHandler}>
          <Text style={styles.timerText}>
            {minutes < 10 ? `0${minutes}` : minutes}:
            {seconds < 10 ? `0${seconds}` : seconds}
          </Text>
        </TouchableOpacity>
      </View>
      <View
        style={
          word.length === 0
            ? styles.nothingWordContainer
            : [
                styles.wordContainer,
                validWordRef.current
                  ? { backgroundColor: COLORS.Accent }
                  : { backgroundColor: COLORS.Primary },
              ]
        }
      >
        <Text style={styles.wordText}>
          {word}
          {alreadyFoundWordRef.current === false &&
          validWordRef.current === true
            ? ` (+${POINTS[word.length]})`
            : ""}
        </Text>
      </View>
      <View
        style={styles.board}
        {...panResponder.panHandlers}
        onLayout={onLayoutBoard}
      >
        {boardRef.current.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((cell, cellIndex) => {
              const isActive = activeTiles.some(
                (tile) => tile.x === rowIndex && tile.y === cellIndex
              );
              return (
                <View
                  key={cellIndex}
                  style={[
                    styles.cell,
                    isActive &&
                      (alreadyFoundWordRef.current
                        ? styles.borderAlreadyFound
                        : validWordRef.current
                        ? styles.borderValidCell
                        : styles.borderActiveCell),
                  ]}
                  onLayout={(event) => onLayoutCell(event, rowIndex, cellIndex)}
                >
                  <Text
                    style={[
                      styles.cellText,
                      isActive &&
                        (alreadyFoundWordRef.current
                          ? styles.textAlreadyFound
                          : validWordRef.current
                          ? styles.textValidCell
                          : styles.textActiveCell),
                    ]}
                  >
                    {cell}
                  </Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>
      <View style={styles.navContainer}>
        <BottomNavBar
          navigation={navigation}
          preferredBoardSize={preferredBoardSize}
          user={user}
        />
      </View>
    </View>
  ) : (
    <View style={styles.background}>
      <View style={styles.navContainer}>
        <BottomNavBar
          navigation={navigation}
          preferredBoardSize={preferredBoardSize}
          user={user}
        />
      </View>
    </View>
  );
}
export default PlayScreen;

const createStyles = (boardLength, height, width, marginSize) => {
  const cellSize = (height * 0.36) / boardLength;
  return StyleSheet.create({
    container: {
      flex: 1,
      position: "relative",
    },
    navContainer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
    },
    svgOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1,
      pointerEvents: "none",
    },
    scoreContainer: {
      marginTop: height * 0.15,
      width: "75%",
      justifyContent: "center",
      alignSelf: "center",
      borderWidth: 1, // Consistent border width
      borderColor: "#e0e0e0", // Matching the border color
      backgroundColor: "#f9f9f9", // Background color similar to gameItemContainer
      borderColor: COLORS.Primary,
      borderRadius: 10, // Rounded corners
      elevation: 10, // Shadow for Android
      shadowColor: "#000000", // Shadow color for iOS
      shadowOffset: { width: 0, height: 6 }, // Shadow offset for iOS
      shadowOpacity: 0.2, // Opacity of shadow for iOS
      shadowRadius: 10, // Blur radius for iOS
      padding: 6, // Internal spacing

      // justifyContent: "top",
      // borderWidth: 1, // Consistent border width
      // borderColor: "#e0e0e0", // Matching the border color
      // backgroundColor: "#f9f9f9", // Background color similar to gameItemContainer
      // borderRadius: 10, // Rounded corners
      // elevation: 3, // Shadow for Android
      // shadowColor: "#000000", // Shadow color for iOS
      // shadowOffset: { width: 0, height: 4 }, // Shadow offset for iOS
      // shadowOpacity: 0.05, // Opacity of shadow for iOS
      // shadowRadius: 8, // Blur radius for iOS
      // padding: 10, // Internal spacing
      borderWidth: 3,
    },
    timerText: {
      color: "gray", // Match the text color
      // fontFamily: "SF-Thin",
      fontWeight: "800",
      fontSize: 14,
      textAlign: "right",
    },
    scoreText: {
      color: COLORS.Primary,
      fontSize: 30,
      fontWeight: "800",
      textAlign: "center",
    },
    scoreWordsText: {
      color: COLORS.Primary,
      color: "gray",
      fontSize: 18,
      fontWeight: "800",
      textAlign: "center",
    },
    background: {
      flex: 1,
      resizeMode: "cover",
      backgroundColor: COLORS.Secondary,
      position: "relative",
    },
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 10,
    },
    title: {
      fontSize: 24,
      color: "white",
      marginBottom: 20,
    },
    wordContainer: {
      marginTop: height * 0.02,
      height: 50,
      // width: "80%", Originally had length of word container as 80% of screen
      // width: "80%",
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      borderWidth: 1, // Consistent border width
      borderColor: "#e0e0e0", // Matching the border color
      backgroundColor: "#f9f9f9", // Background color similar to gameItemContainer
      borderRadius: 10, // Rounded corners
      elevation: 3, // Shadow for Android
      shadowColor: "#000000", // Shadow color for iOS
      shadowOffset: { width: 0, height: 4 }, // Shadow offset for iOS
      shadowOpacity: 0.05, // Opacity of shadow for iOS
      shadowRadius: 8, // Blur radius for iOS
      padding: 10, // Internal spacing
    },
    nothingWordContainer: {
      marginTop: height * 0.02,
      height: 50,
      // width: "80%", Originally had length of word container as 80% of screen
      // width: "80%",
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      backgroundColor: COLORS.Secondary, // Background color similar to gameItemContainer
      padding: 10, // Internal spacing
    },
    defaultWordContainerColor: {
      backgroundColor: COLORS.Primary,
    },
    wordText: {
      paddingHorizontal: width * 0.02,
      fontSize: 24,
      fontWeight: "bold",
      color: COLORS.Secondary,
    },
    board: {
      padding: 10,
      marginTop: height * 0.01,
      justifyContent: "center",
      alignItems: "center",
      alignSelf: "center",
      borderRadius: 8,
      elevation: 3, // This adds shadow on Android, similar to box-shadow
      shadowColor: "#000000", // Shadow color for iOS
      shadowOffset: { width: 0, height: 4 }, // Shadow offset for iOS, similar to the horizontal and vertical offsets in CSS
      shadowOpacity: 0.05, // Opacity of shadow for iOS
      shadowRadius: 8, // Blur radius for iOS
      borderRadius: 10, // Rounded corners
      borderColor: COLORS.Primary,
      borderWidth: 5,
      borderRadius: 15,
    },
    row: {
      flexDirection: "row",
    },
    cell: {
      margin: 2,
      width: cellSize,
      height: cellSize,
      justifyContent: "center",
      alignItems: "center",
      // borderWidth: 1,
      // borderColor: "#000",
      backgroundColor: "#ffffff",
      // Idk why but this is like the goated sauce for making stuff pop out lol

      borderRadius: 15,
      elevation: 3, // This adds shadow on Android, similar to box-shadow
      shadowColor: "#000000", // Shadow color for iOS
      shadowOffset: { width: 0, height: 4 }, // Shadow offset for iOS, similar to the horizontal and vertical offsets in CSS
      shadowOpacity: 0.05, // Opacity of shadow for iOS
      shadowRadius: 8, // Blur radius for iOS
      borderRadius: 10, // Rounded corners
      borderWidth: 1,
      borderColor: "#e0e0e0",
      // margin: 3,
    },
    // A680A3 light
    // 82267E dark
    activeCell: {
      backgroundColor: COLORS.Light, // This is a much lighter color I think it's more playable
    },
    validCell: {
      backgroundColor: COLORS.Accent,
    },
    alreadyFound: {
      backgroundColor: COLORS.AlreadyFound,
    },
    cellText: {
      // 0.65
      fontSize: cellSize * 0.6,
      color: "#000",
      fontWeight: "800",
    },
    svgContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1, // Ensure the SVG is on top
    },
    borderAlreadyFound: {
      borderColor: COLORS.AlreadyFound,
      borderWidth: 7,
      borderRadius: 20,
    },
    borderValidCell: {
      borderColor: COLORS.Accent,
      borderWidth: 7,
      borderRadius: 20,
    },
    borderActiveCell: {
      borderColor: COLORS.Light, // This is a much lighter color I think it's more playable
      borderWidth: 7,
      borderRadius: 20,
    },
    textAlreadyFound: {
      color: COLORS.AlreadyFound,
      // fontSize: cellSize * 0.7,
    },
    textValidCell: {
      color: COLORS.Accent,
      // fontSize: cellSize * 0.7,
    },
    textActiveCell: {
      color: COLORS.Light,
      // fontSize: cellSize * 0.7,
    },
    noUserContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: COLORS.Secondary,
    },
    noUserInfoText: {
      fontSize: 16,
      textAlign: "center",
      color: "black", // Match the text color
      fontFamily: "SF-Pro",
      fontWeight: "600", // Semi-bold weight
      letterSpacing: -0.5, // Reducing letter spacing
      lineHeight: 20, // You might need to adjust this based on your font size
      color: "#333", // Dark gray color for the text
    },
    noUserLinkText: {
      fontSize: 16,
      color: COLORS.Primary, // Use your primary color for the link
      textDecorationLine: "underline",
      fontFamily: "SF-Pro",
      marginTop: 10,
    },
    noUserNavContainer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
    },
  });
};
