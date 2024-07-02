// components/CustomButton.js
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

const Button = ({ navigation, title, preferredBoardSize }) => {
  function nextPage() {
    if (title == "4x4" || title == "5x5" || title == "2x2") {
      const boardLength = parseInt(title[0]);
      navigation.replace("PlayScreen", { boardLength, preferredBoardSize });
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
    backgroundColor: "#a02f58",
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
  },
});

export default Button;
