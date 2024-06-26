import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  PanResponder,
  Vibration,
  Animated,
} from "react-native";
import Svg, { Line } from "react-native-svg";
import LETTER_DIST from "../data/letter-distribution";
import POINTS from "../data/point-distribution";
import AhoCorasick from "aho-corasick";
import * as Haptics from "expo-haptics";
import { getStatusBarHeight } from "react-native-status-bar-height";
import BottomNavBar from "../components/BottomNavBar";

function PlayScreen({ navigation, route }) {
  const { words, trie, boardLength } = route.params;
  const statusBarHeight = getStatusBarHeight();
  const { height, width } = Dimensions.get("window");
  console.log(trie.tree());
  // Buff multiplier of 0.1 works pretty good
  const buffer = ((height * 0.4) / boardLength) * 0.1;
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

  const automatonRef = useRef(null);

  useEffect(() => {
    if (!automatonRef.current) {
      const automaton = new AhoCorasick(words);
      words.forEach((word) => automaton.add(word, word));
      automaton.build_fail();
      automatonRef.current = automaton;
    }
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

  useEffect(() => {
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
    for (let i = 0; i < boardLength; i++) {
      newBoard[i] = [];
      for (let j = 0; j < boardLength; j++) {
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

    // Put the shuffled items back into newBoard
    let index = 0;
    for (let i = 0; i < boardLength; i++) {
      for (let j = 0; j < boardLength; j++) {
        newBoard[i][j] = flatBoard[index++];
      }
    }
    setBoard(newBoard);
  }, [boardLength]);

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
    const { width, height } = event.nativeEvent.layout;
    const key = `${rowIndex}-${cellIndex}`;
    const cell = event.target;
    requestAnimationFrame(() => {
      setTimeout(() => {
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
      }, 0);
    });
  };

  const getCellLayout = (rowIndex, cellIndex) => {
    const key = `${rowIndex}-${cellIndex}`;
    return cellLayoutsRef.current[key];
  };

  const findCell = (touchX, touchY) => {
    for (let x = 0; x < boardLength; x++) {
      for (let y = 0; y < boardLength; y++) {
        let layout = getCellLayout(x, y);
        if (layout) {
          if (
            touchX - buffer >= layout.x &&
            touchX + buffer <= layout.x + layout.width &&
            touchY - buffer >= layout.y &&
            touchY + buffer <= layout.y + layout.height
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
        updateActiveTilesLoc(x, y); // Update the location
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
          updateActiveTilesLoc(x, y); // Update the location
          return;
        }
        let dist = Math.sqrt(
          Math.abs(lastActiveRef.current[0] - x) ** 2 +
            Math.abs(lastActiveRef.current[1] - y) ** 2
        );
        if (dist < 2) {
          setWordHandler(boardRef.current[x][y], { x, y });
          updateActiveTilesLoc(x, y); // Update the location
          lastActiveRef.current = [x, y];
        }
        // console.log("current locs: ", activeTilesLocRef.current);
        let found = false;
        automatonRef.current.search(wordRef.current, (word, data, offset) => {
          if (word === wordRef.current) {
            found = true;
          }
        });

        if (found) {
          if (!wordsFoundRef.current.includes(wordRef.current)) {
            setAlreadyFoundWord(false);
            alreadyFoundWordRef.current = false;
            setValidWord(true);
            validWordRef.current = true;
            // Vibration.vibrate(10000);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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

  const styles = createStyles(boardLength, height);

  return (
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
                stroke="red"
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
      </View>
      <View
        style={[
          styles.wordContainer,
          validWordRef.current
            ? styles.validCell
            : styles.defaultWordContainerColor,
        ]}
      >
        <Text style={styles.wordText}>{word}</Text>
      </View>
      <View
        style={styles.board}
        {...panResponder.panHandlers}
        onLayout={onLayoutBoard}
      >
        {board.map((row, rowIndex) => (
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
        <BottomNavBar navigation={navigation} />
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
      pointerEvents: "none", // Ensure the SVG doesn't intercept touch events
    },
    scoreContainer: {
      marginTop: height * 0.1,
      height: 50,
      // width: "80%", Originally had length of word container as 80% of screen
      width: "80%",
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
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
      marginTop: height * 0.1,
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
      backgroundColor: "#82267E", // Green background for valid words
    },
    alreadyFound: {
      backgroundColor: "#660000",
      backgroundColor: "#FFD700",
    },
    cellText: {
      // 0.65
      fontSize: cellSize * 0.65,
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
