import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
  FlatList,
} from "react-native";
import BottomNavBar from "../components/BottomNavBar";
import POINTS from "../data/point-distribution";

function EndGameScreen({ navigation, route }) {
  const { allWords, foundWords, words, score } = route.params;

  const [activeTab, setActiveTab] = useState("Found");
  const [currentPage, setCurrentPage] = useState("Results");
  const [pointSum, setPointSum] = useState(0);

  useEffect(() => {
    let totalPoints = 0;

    allWords.forEach((word) => {
      const points = POINTS[word.length] || 0;
      totalPoints += points;
    });

    setPointSum(totalPoints);
  }, [allWords]);

  const sortWords = (words) => {
    return words.sort((a, b) => {
      if (b.length === a.length) {
        return a.localeCompare(b);
      }
      return b.length - a.length;
    });
  };

  const sortedAllWords = sortWords(allWords);
  const sortedFoundWords = sortWords(foundWords);

  const wordsToDisplay =
    activeTab === "Found" ? sortedFoundWords : sortedAllWords;

  const renderItem = ({ item }) => {
    const points = POINTS[item.length] || 0;
    return (
      <View style={styles.wordContainer}>
        <Text style={styles.wordText}>{item}</Text>
        <Text style={styles.pointText}>{points}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.pageContainer}>
        <TouchableOpacity
          style={[
            styles.pageTab,
            currentPage === "Results" && styles.pageActiveTab,
          ]}
          onPress={() => setCurrentPage("Results")}
        >
          <Text
            style={[
              styles.pageTabText,
              currentPage === "Results" && styles.pageActiveTabText,
            ]}
          >
            Results
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.pageTab,
            currentPage === "Review" && styles.pageActiveTab,
          ]}
          onPress={() => setCurrentPage("Review")}
        >
          <Text
            style={[
              styles.pageTabText,
              currentPage === "Review" && styles.pageActiveTabText,
            ]}
          >
            Review
          </Text>
        </TouchableOpacity>
      </View>
      {currentPage === "Results" && (
        <>
          <View style={styles.scoreContainer}>
            <Text style={styles.title}>
              Score: {activeTab === "Found" ? score : pointSum}
            </Text>
            <Text style={styles.title}>
              Words: {activeTab === "Found" ? words : allWords.length}
            </Text>
          </View>
          <View style={styles.scrollContainer}>
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
            <FlatList
              data={wordsToDisplay}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </>
      )}
      <View style={styles.navContainer}>
        <BottomNavBar navigation={navigation} />
      </View>
    </View>
  );
}

export default EndGameScreen;

const { height, width } = Dimensions.get("window");

const styles = StyleSheet.create({
  scoreContainer: {
    marginVertical: height * 0.02,
    height: 50,
    width: "80%",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  pageActiveTabText: {
    color: "#a02f58",
    fontWeight: "bold",
  },
  pageTabText: {
    fontSize: 18,
    color: "gray",
  },
  pageTab: {
    flex: 1,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    alignItems: "center",
  },
  pageActiveTab: {
    borderBottomColor: "#a02f58",
  },
  pageContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#FBF4F6",
    paddingTop: 40,
    marginTop: height * 0.03,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#a02f58",
  },
  tabContainer: {
    flexDirection: "row",
    position: "absolute",
    top: -30, // Adjust this value to position the tabs above the words container
    left: 10, // Adjust this value to position the tabs on the top left of the words container
    zIndex: 1, // Ensure tabs are above other elements
  },
  tab: {
    paddingVertical: 5,
    flex: 1,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#a02f58",
    backgroundColor: "#FBF4F6",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginRight: 5,
  },
  activeTab: {
    backgroundColor: "#a02f58",
  },
  tabText: {
    fontSize: 14,
    color: "gray",
  },
  activeTabText: {
    color: "#FBF4F6",
    fontWeight: "bold",
  },
  scrollContainer: {
    width: "60%",
    height: "50%",
    backgroundColor: "#ffffff",
    marginTop: height * 0.05,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#a02f58",
    position: "relative",
  },
  scrollContent: {
    flexGrow: 1,
  },
  wordContainer: {
    flexDirection: "row",
    justifyContent: "space-between", // Ensure words are left aligned and points are right aligned
    paddingVertical: 2,
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
  summaryContainer: {
    marginTop: 10,
    alignItems: "center",
  },
  summaryText: {
    fontSize: 18,
    color: "#a02f58",
    fontWeight: "bold",
  },
  navContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});
