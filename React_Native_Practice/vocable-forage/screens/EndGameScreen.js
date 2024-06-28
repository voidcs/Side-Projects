import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
} from "react-native";
import { useFonts } from "expo-font";
import BottomNavBar from "../components/BottomNavBar";
import POINTS from "../data/point-distribution"; // Import the POINTS array

function EndGameScreen({ navigation, route }) {
  const { height, width } = Dimensions.get("window");

  const { allWords, foundWords } = route.params;
  const [fontsLoaded] = useFonts({
    "RobotoMono-Regular": require("../assets/fonts/RobotoMono-Regular.ttf"),
    "RobotoMono-Bold": require("../assets/fonts/RobotoMono-Bold.ttf"),
  });
  const [activeTab, setActiveTab] = useState("Found");

  const sortedAllWords = allWords.sort((a, b) => b.length - a.length);
  const sortedFoundWords = foundWords.sort((a, b) => b.length - a.length);

  const wordsToDisplay =
    activeTab === "Found" ? sortedFoundWords : sortedAllWords;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>End Screen</Text>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "Found" && styles.activeTab]}
          onPress={() => setActiveTab("Found")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "Found" && styles.activeTabText,
            ]}
          >
            Found
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "All" && styles.activeTab]}
          onPress={() => setActiveTab("All")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "All" && styles.activeTabText,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.scrollContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          {wordsToDisplay.map((word, index) => {
            const points = POINTS[word.length] || 0; // Get the point value for the word length
            return (
              <View key={index} style={styles.wordContainer}>
                <Text style={styles.wordText}>{word}</Text>
                <Text style={styles.pointText}>{points}</Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
      <View style={styles.navContainer}>
        <BottomNavBar navigation={navigation} />
      </View>
    </View>
  );
}

export default EndGameScreen;
const { height, width } = Dimensions.get("window");
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
  tabContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    alignItems: "center",
  },
  activeTab: {
    borderBottomColor: "#a02f58",
  },
  tabText: {
    fontSize: 18,
    color: "gray",
  },
  activeTabText: {
    color: "#a02f58",
    fontWeight: "bold",
  },
  scrollContainer: {
    width: "60%",
    height: "50%", // Set height to 50% of the parent container
    backgroundColor: "#ffffff",
    marginTop: height * 0.05,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1, // Add border width
    borderColor: "#a02f58", // Add border color
  },
  scrollContent: {
    flexGrow: 1,
  },
  wordContainer: {
    flexDirection: "row",
    justifyContent: "space-between", // Ensure words are left aligned and points are right aligned
    paddingVertical: 2, // Reduced padding to make words closer together
  },
  wordText: {
    fontSize: 18,
    textAlign: "left",
    fontFamily: Platform.OS === "ios" ? "RobotoMono-Regular" : "monospace", // SF Mono or Menlo?
    flex: 1,
  },
  pointText: {
    fontSize: 18,
    textAlign: "right",
    fontFamily: Platform.OS === "ios" ? "RobotoMono-Regular" : "monospace", // Sf Mono or Menlo
  },
  navContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});
