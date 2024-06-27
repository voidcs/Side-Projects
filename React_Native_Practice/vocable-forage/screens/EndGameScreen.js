import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import BottomNavBar from "../components/BottomNavBar";

function EndGameScreen({ navigation, route }) {
  const { allWords } = route.params;

  // Sort words from longest to shortest
  const sortedWords = allWords.sort((a, b) => b.length - a.length);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>End Screen</Text>
      <View style={styles.scrollContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {sortedWords.map((word, index) => (
            <Text key={index} style={styles.wordText}>
              {word}
            </Text>
          ))}
        </ScrollView>
      </View>
      <View style={styles.navContainer}>
        <BottomNavBar navigation={navigation} />
      </View>
    </View>
  );
}

export default EndGameScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#FBF4F6",
    paddingTop: 40, // Add padding to the top to prevent title from going above the screen
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 20,
    color: "#a02f58",
  },
  scrollContainer: {
    width: "80%",
    height: "50%", // Set height to 50% of the parent container
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1, // Add border width
    borderColor: "#a02f58", // Add border color
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  wordText: {
    fontSize: 18,
    paddingVertical: 5,
    textAlign: "center",
  },
  navContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});
