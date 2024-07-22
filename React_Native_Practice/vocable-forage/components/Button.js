import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { v4 as uuidv4 } from "uuid";
import COLORS from "../data/color";

const Button = ({
  navigation,
  title,
  preferredBoardSize,
  user,
  height,
  width,
}) => {
  const styles = createStyles(height, width);

  function nextPage() {
    if (title === "4x4" || title === "5x5" || title === "2x2") {
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
      activeOpacity={0.8}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const createStyles = (height, width) => {
  return StyleSheet.create({
    button: {
      backgroundColor: COLORS.Primary,
      borderWidth: 0,
      alignItems: "center",
      height: height * 0.1,
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      borderRadius: 25,
      paddingVertical: 10,
      width: "80%",
      justifyContent: "center",
      marginVertical: 10,
    },
    buttonText: {
      fontSize: 24,
      textAlign: "center",
      color: COLORS.Secondary,
      fontWeight: "bold",
    },
  });
};

export default Button;
