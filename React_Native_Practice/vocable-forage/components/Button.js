import React, { useState } from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { v4 as uuidv4 } from "uuid";
import COLORS from "../data/color";
import LoadingScreen from "../screens/LoadingScreen";

const Button = ({
  navigation,
  title,
  preferredBoardSize,
  user,
  height,
  width,
}) => {
  console.log("height: ", height, "width: ", width);
  const styles = createStyles(height, width);
  function nextPage() {
    if (title == "4x4" || title == "5x5" || title == "2x2") {
      const boardLength = parseInt(title[0]);
      const gameId = uuidv4(); // Generate a 128-bit UUID string

      // Use a short delay to allow LoadingScreen to render
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

const createStyles = (height, width) => {
  return StyleSheet.create({
    button: {
      backgroundColor: "#f9f9f9",
      borderWidth: 1,
      borderColor: "#e0e0e0",
      flexDirection: "row",
      alignItems: "center",
      height: height * 0.1,
      elevation: 3,
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      borderRadius: 10,
      padding: 10,
      justifyContent: "center",

      marginVertical: 2,
    },
    buttonText: {
      fontSize: 24,
      textAlign: "center",
      color: COLORS.Primary,
      fontFamily: "SF-Pro",
      fontWeight: "600",
      letterSpacing: -0.5, // Reducing letter spacing
      // color: "#333",
    },
  });
};

export default Button;
