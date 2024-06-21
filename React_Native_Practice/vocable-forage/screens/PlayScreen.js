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
  const [board, setBoard] = useState([]);
  const [layoutsReady, setLayoutsReady] = useState(false); // State to check if layouts are ready

  const cellLayoutsRef = useRef({});
  const boardLayoutRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

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
          // Set layoutsReady to true after the board layout is measured
          // console.log(
          //   `Board - x: ${pageX}, y: ${pageY}, width: ${width}, height: ${height}`
          // );
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
          // console.log(
          //   `Cell ${key} - x: ${pageX}, y: ${pageY}, width: ${width}, height: ${height}`
          // );
          cnt++;
          if (cnt == boardLength * boardLength) {
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
    for (let i = 0; i < boardLength; i++) {
      for (let j = 0; j < boardLength; j++) {
        let layout = getCellLayout(i, j);
        if (layout) {
          if (
            touchX >= layout["x"] &&
            touchX <= layout["x"] + layout["width"] &&
            touchY >= layout["y"] &&
            touchY <= layout["y"] + layout["height"]
          ) {
            return { i, j };
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
        const touchX = e.nativeEvent.pageX;
        const touchY = e.nativeEvent.pageY;
        const cell = findCell(touchX, touchY);
        console.log(cell);
      },
      onPanResponderMove: (e, gestureState) => {
        const touchX = e.nativeEvent.pageX;
        const touchY = e.nativeEvent.pageY;
        // console.log(`Finger moved to x: ${touchX}, y: ${touchY}`);
        const cell = findCell(touchX, touchY);
        console.log(cell);
      },
      onPanResponderRelease: (e, gestureState) => {
        const touchX = e.nativeEvent.pageX;
        const touchY = e.nativeEvent.pageY;
        const cell = findCell(touchX, touchY);
        console.log(`Finger released at`, cell);
      },
    })
  ).current;

  const { height } = Dimensions.get("window");
  const styles = createStyles(boardLength, height);

  return (
    <ImageBackground
      source={require("../assets/morocco-blue.png")}
      style={styles.background}
    >
      <View>
        <Text>Play Screen with size {boardLength}</Text>
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
    board: {
      padding: 5,
      backgroundColor: "#1b3620",
      marginTop: height * 0.25,
      justifyContent: "center",
      alignItems: "center",
      alignSelf: "center",
      borderRadius: 16,
    },
    row: {
      flexDirection: "row",
    },
    cell: {
      margin: 3,
      width: cellSize,
      height: cellSize,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#000",
      backgroundColor: "#ffffff",
      borderRadius: 12,
    },
    cellText: {
      fontSize: cellSize * 0.65,
      color: "#000",
      fontWeight: "800",
    },
  });
};
