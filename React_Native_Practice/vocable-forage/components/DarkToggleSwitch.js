import React from "react";
import { View, Text, StyleSheet, TouchableWithoutFeedback } from "react-native";
import COLORS from "../data/color";

const ToggleSwitch = ({ selected, setSelectedHandler }) => {
  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={() => setSelectedHandler("All Games")}>
        <View
          style={[styles.button, selected === "All Games" && styles.selected]}
        >
          <Text
            style={[
              styles.text,
              selected === "All Games" && styles.selectedText,
            ]}
          >
            All Games
          </Text>
        </View>
      </TouchableWithoutFeedback>
      <TouchableWithoutFeedback onPress={() => setSelectedHandler("Favorites")}>
        <View
          style={[styles.button, selected === "Favorites" && styles.selected]}
        >
          <Text
            style={[
              styles.text,
              selected === "Favorites" && styles.selectedText,
            ]}
          >
            Favorites
          </Text>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "80%",
    flexDirection: "row",
    backgroundColor: "#1e1e1e", // Dark background for the container
    borderRadius: 25,
    overflow: "hidden",
    padding: 4, // Add padding to the container
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  selected: {
    backgroundColor: "#2e2e2e", // Darker background for the selected button
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderRadius: 20, // Add border radius for the selected button
    margin: 2, // Adjust margin to create padding effect
  },
  text: {
    color: "#b0b0b0", // Light text color
  },
  selectedText: {
    color: COLORS.Primary,
    fontWeight: "bold",
  },
});

export default ToggleSwitch;
