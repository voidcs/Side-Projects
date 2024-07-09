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
import AhoCorasick from "aho-corasick";
import createTrie from "trie-prefix-tree";
import * as Haptics from "expo-haptics";
import { getStatusBarHeight } from "react-native-status-bar-height";
import BottomNavBar from "../components/BottomNavBar";

function PlayScreen({ navigation, route }) {
  // should be able to open a board with a data base, so you give the id
  // if the id is in the table, then we read the board in front the data base
  // otherwise we just generate it, and then add it to the database
  const gameTime = 90;
  const [timer, setTimer] = useState(gameTime);

  const wordsRef = useRef([]);
  const boardLengthRef = useRef(0);
  const preferredBoardSizeRef = useRef(0);
  const bufferRef = useRef(0);

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
    const {
      words: routeWords,
      boardLength: routeBoardLength,
      preferredBoardSize: routePreferredBoardSize,
      user: user,
      gameId: routeGameId,
    } = route.params;
    setUser(user);
    setWords(routeWords);
    setBoardLength(routeBoardLength);
    setPreferredBoardSize(routePreferredBoardSize);

    wordsRef.current = routeWords;
    boardLengthRef.current = routeBoardLength;
    preferredBoardSizeRef.current = routePreferredBoardSize;
    const { height, width } = Dimensions.get("window");
    bufferRef.current = ((height * 0.4) / routePreferredBoardSize) * 0.1;

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
          console.log("Game data fetched successfully");
          // Handle the game data as needed
          startGameRef.current = true;
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
            touchX - bufferRef.current >= layout.x &&
            touchX + bufferRef.current <= layout.x + layout.width &&
            touchY - bufferRef.current >= layout.y &&
            touchY + bufferRef.current <= layout.y + layout.height
          ) {
            return { x, y };
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
      },
    })
  ).current;
  const styles = createStyles(boardLengthRef.current, height);
  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;
  return boardRef.current.length > 0 ? (
    <View style={styles.background}>
      <Svg
        style={styles.svgOverlay}
        height={height}
        width={width}
        viewBox={`0 0 ${width} ${height}`}
      >
        {activeTilesLocRef.current.map((point, index) => {
          if (index < activeTilesLocRef.current.length - 1) {
            const nextPoint = activeTilesLocRef.current[index + 1];
            return (
              <Line
                key={index}
                x1={point.x}
                y1={point.y}
                x2={nextPoint.x}
                y2={nextPoint.y}
                stroke={validWordRef.current ? "white" : "red"}
                strokeWidth="12"
                strokeLinecap="round"
                strokeOpacity="0.5"
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
        style={[
          styles.wordContainer,
          validWordRef.current
            ? styles.validCell
            : styles.defaultWordContainerColor,
        ]}
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
                        ? styles.alreadyFound
                        : validWordRef.current
                        ? styles.validCell
                        : styles.activeCell),
                  ]}
                  onLayout={(event) => onLayoutCell(event, rowIndex, cellIndex)}
                >
                  <Text style={styles.cellText}>{cell}</Text>
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

const createStyles = (boardLength, height) => {
  const cellSize = (height * 0.4) / boardLength;
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
      marginTop: height * 0.12,
      height: 50,
      // width: "80%", Originally had length of word container as 80% of screen
      width: "80%",
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
    },
    timerText: {
      marginTop: 10,
      color: "#a02f58",
      fontSize: 24,
      fontWeight: "800",
    },
    scoreText: {
      color: "#a02f58",
      fontSize: 36,
      fontWeight: "800",
    },
    scoreWordsText: {
      color: "#a02f58",
      fontSize: 24,
      fontWeight: "800",
    },
    background: {
      flex: 1,
      resizeMode: "cover",
      backgroundColor: "#FBF4F6",
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
      marginTop: height * 0.08,
      marginBottom: height * 0.02,
      height: 50,
      // width: "80%", Originally had length of word container as 80% of screen
      width: "80%",
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
    },
    defaultWordContainerColor: {
      backgroundColor: "#a02f58",
    },
    wordText: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#FBF4F6",
    },
    board: {
      padding: 5,
      backgroundColor: "#a02f58",
      marginTop: height * 0.02,
      justifyContent: "center",
      alignItems: "center",
      alignSelf: "center",
      borderRadius: 8,
    },
    row: {
      flexDirection: "row",
    },
    cell: {
      margin: 1.5,
      width: cellSize,
      height: cellSize,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#000",
      backgroundColor: "#ffffff",
      borderRadius: 8,
    },
    // A680A3 light
    // 82267E dark
    activeCell: {
      backgroundColor: "#A680A3",
      backgroundColor: "#dbbfd9", // This is a much lighter color I think it's more playable
    },
    validCell: {
      backgroundColor: "#82267E",
    },
    alreadyFound: {
      backgroundColor: "#660000",
      backgroundColor: "#FFD700",
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
  });
};
