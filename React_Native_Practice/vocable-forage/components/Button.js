// components/CustomButton.js
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { v4 as uuidv4 } from "uuid";
import COLORS from "../data/color";

const Button = ({ navigation, title, preferredBoardSize, user }) => {
  function nextPage() {
    if (title == "4x4" || title == "5x5" || title == "2x2") {
      const boardLength = parseInt(title[0]);
      const gameId = uuidv4(); // Generate a 128-bit UUID string

      navigation.replace("PlayScreen", {
        boardLength,
        preferredBoardSize,
        user,
        gameId,
      });
    }
  }
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={nextPage}
      activeOpacity={0.65}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.Primary,
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 5,
  },
  buttonText: {
    color: COLORS.Secondary,
    fontSize: 32,
    fontWeight: "bold",
  },
});

export default Button;
