import React, { useState } from "react";
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
    width: "90%",
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
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
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderRadius: 20, // Add border radius for the selected button
    margin: 2, // Adjust margin to create padding effect
  },
  text: {
    color: "gray",
  },
  selectedText: {
    color: COLORS.Primary,
    fontWeight: "bold",
  },
});

export default ToggleSwitch;
