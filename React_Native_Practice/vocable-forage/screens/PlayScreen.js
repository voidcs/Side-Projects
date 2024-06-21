import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Dimensions,
  PanResponder,
} from "react-native";
import LETTER_DIST from "../data/letter-distribution";

function PlayScreen({ navigation, route }) {
  const { boardLength } = route.params;
  const { height } = Dimensions.get("window");
  const buffer = ((height * 0.4) / boardLength) * 0.1;
  const [board, setBoard] = useState([]);
  const [layoutsReady, setLayoutsReady] = useState(false); // State to check if layouts are ready

  const cellLayoutsRef = useRef({});
  const boardLayoutRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const boardRef = useRef(board); // Ref to store the latest board state
  const lastActiveRef = useRef([-1, -1]); // Ref to store the last active cell
  const wordRef = useRef(""); // Ref to store the current word

  const [word, setWord] = useState("");

  const setWordHandler = (ch) => {
    setWord((prevString) => {
      return prevString + ch;
    });
    wordRef.current += ch;
  };

  useEffect(() => {
    // Update the ref whenever the board state changes
    boardRef.current = board;
  }, [board]);

  useEffect(() => {
    // Generate letters
    const letters = [];
    for (let i = 0; i < 26; i++) {
      let letter = String.fromCharCode("A".charCodeAt(0) + i);
      for (let j = 0; j < LETTER_DIST[letter]; j++) {
        letters.push(letter);
      }
    }

    // Initialize frequency map
    const freq = {};
    for (let i = 0; i < 26; i++) {
      let letter = String.fromCharCode("A".charCodeAt(0) + i);
      freq[letter] = 0;
    }

    // Generate the board
    const newBoard = [];
    for (let i = 0; i < boardLength; i++) {
      newBoard[i] = [];
      for (let j = 0; j < boardLength; j++) {
        let randomIndex = Math.floor(Math.random() * letters.length);
        // Ensure no more than 2 of each letter
        while (freq[letters[randomIndex]] >= 2) {
          randomIndex = Math.floor(Math.random() * letters.length);
        }
        newBoard[i][j] = letters[randomIndex];
        // let r = Math.floor(Math.random() * 3);
        // if (r == 0) {
        //   newBoard[i][j] = "E";
        // } else if (r == 1) {
        //   newBoard[i][j] = "R";
        // } else {
        //   newBoard[i][j] = "S";
        // }
        // newBoard[i][j] = "?";
        freq[letters[randomIndex]]++;
      }
    }
    setBoard(newBoard);
  }, [boardLength]);

  useEffect(() => {
    if (layoutsReady) {
      // Print the layout for each cell after they are ready
      for (let i = 0; i < boardLength; i++) {
        for (let j = 0; j < boardLength; j++) {
          let layout = getCellLayout(i, j);
          // console.log(i, j, ": ", layout);
        }
      }
    }
  }, [layoutsReady]); // Trigger this effect when layoutsReady changes

  const onLayoutBoard = (event) => {
    const board = event.target;
    requestAnimationFrame(() => {
      setTimeout(() => {
        board.measure((x, y, width, height, pageX, pageY) => {
          boardLayoutRef.current = { x: pageX, y: pageY, width, height };
          // console.log("asdasd: ", width, height); It's a fucking square man
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
          if (cnt === boardLength * boardLength) {
            setLayoutsReady(true);
          }
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

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (e, gestureState) => {
        // When we initially press an element
        const touchX = e.nativeEvent.pageX;
        const touchY = e.nativeEvent.pageY;
        const cell = findCell(touchX, touchY);
        if (cell === -1) {
          return;
        }
        const { x, y } = cell;
        lastActiveRef.current = [x, y];
        setWordHandler(boardRef.current[x][y]);
        // console.log(boardRef.current[x][y]);
        // console.log("Starting at: ", [x, y]);
      },
      onPanResponderMove: (e, gestureState) => {
        // When we drag to an element
        const touchX = e.nativeEvent.pageX;
        const touchY = e.nativeEvent.pageY;
        const cell = findCell(touchX, touchY);
        if (cell === -1) {
          return;
        }
        const { x, y } = cell;
        // console.log("on hold last: ", lastActiveRef.current);
        if (x === lastActiveRef.current[0] && y === lastActiveRef.current[1]) {
          return;
        }
        // Check if (x, y) is adjacent
        // console.log("x y: ", x, y);
        // console.log("lastActive: ", lastActiveRef.current);
        let dist = Math.sqrt(
          Math.abs(lastActiveRef.current[0] - x) ** 2 +
            Math.abs(lastActiveRef.current[1] - y) ** 2
        );
        // console.log("dist: ", dist);
        if (dist < 2) {
          setWordHandler(boardRef.current[x][y]);
          lastActiveRef.current = [x, y];
        }
        // console.log(
        //   "word: ",
        //   wordRef.current,
        //   "lastActive: ",
        //   lastActiveRef.current
        // );
        // console.log(cell);
      },
      onPanResponderRelease: (e, gestureState) => {
        const touchX = e.nativeEvent.pageX;
        const touchY = e.nativeEvent.pageY;
        const cell = findCell(touchX, touchY);
        // console.log(`Finger released at`, cell);
        setWord("");
        wordRef.current = ""; // Reset wordRef
        lastActiveRef.current = [-1, -1]; // Reset last active cell
      },
    })
  ).current;

  const styles = createStyles(boardLength, height);

  return (
    <ImageBackground
      source={require("../assets/morocco-blue.png")}
      style={styles.background}
    >
      <View style={styles.wordContainer}>
        <Text style={styles.wordText}>{word}</Text>
      </View>
      <View
        style={styles.board}
        {...panResponder.panHandlers}
        onLayout={onLayoutBoard}
      >
        {board.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((cell, cellIndex) => (
              <View
                key={cellIndex}
                style={styles.cell}
                onLayout={(event) => onLayoutCell(event, rowIndex, cellIndex)}
              >
                <Text style={styles.cellText}>{cell}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </ImageBackground>
  );
}
export default PlayScreen;

const createStyles = (boardLength, height) => {
  const cellSize = (height * 0.4) / boardLength;
  return StyleSheet.create({
    background: {
      flex: 1,
      resizeMode: "cover",
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
      height: 50, // Fixed height for the word container
      width: "80%",
      backgroundColor: "rgba(255, 255, 255, 0.7)",
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
    },
    wordText: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#333",
    },
    board: {
      padding: 5,
      backgroundColor: "#1b3620",
      marginTop: height * 0.05,
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
    cellText: {
      // 0.65
      fontSize: cellSize * 0.65,
      color: "#000",
      fontWeight: "800",
    },
  });
};
