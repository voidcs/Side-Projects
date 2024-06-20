import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useEffect } from "react";
import LETTER_DIST from "../data/letter-distribution";
import * as FileSystem from "expo-file-system";
import * as Asset from "expo-asset";
function PlayScreen({ navigation, route }) {
  const { boardLength } = route.params;
  letters = [];
  for (let i = 0; i < 26; i++) {
    let letter = String.fromCharCode("A".charCodeAt(0) + i);
    for (let j = 0; j < LETTER_DIST[letter]; j++) {
      letters.push(letter);
    }
  }
  const board = [];
  freq = {};
  for (let i = 0; i < 26; i++) {
    let letter = String.fromCharCode("A".charCodeAt(0) + i);
    freq[letter] = 0;
  }

  for (let i = 0; i < boardLength; i++) {
    board[i] = [];
    for (let j = 0; j < boardLength; j++) {
      let randomIndex = Math.floor(Math.random() * letters.length);
      // Cannot have more than 2 of each letter
      while (freq[letters[randomIndex]] >= 2) {
        randomIndex = Math.floor(Math.random() * letters.length);
      }
      board[i][j] = letters[randomIndex];
      freq[letters[randomIndex]]++;
    }
  }

  function printBoard() {
    for (let i = 0; i < boardLength; i++) {
      let row = "";
      for (let j = 0; j < boardLength; j++) {
        row += board[i][j] + " ";
      }
      console.log(row.trim()); // Print the row
    }
    console.log();
  }
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
      <View style={styles.board}>
        {board.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((cell, cellIndex) => (
              <View
                id={rowIndex.toString() + cellIndex.toString()}
                key={cellIndex}
                style={styles.cell}
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
