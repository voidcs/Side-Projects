import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Button,
  Dimensions,
} from "react-native";
import { parse } from "date-fns";
import BottomNavBar from "../components/BottomNavBar";
import POINTS from "../data/point-distribution";
import { useFonts } from "expo-font";

const ITEMS_PER_PAGE = 5;

function HistoryScreen({ navigation, route }) {
  useFonts({
    "SF-Thin": require("../assets/fonts/SF-Pro-Text-Thin.otf"),
    "SF-Pro": require("../assets/fonts/SF-Pro.ttf"),
  });
  const { preferredBoardSize, user } = route.params;
  console.log("in history: ", user.friends);
  const { height, width } = Dimensions.get("window");
  const styles = createStyles(height, width);

  const [userData, setUserData] = useState(null);
  const [games, setGames] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [render, setRender] = useState(false);
  const fetchedGameIdsRef = useRef(new Set()); // Maintain a set of fetched game IDs

  useEffect(() => {
    const getUser = async () => {
      const start = performance.now();
      try {
        setGames([]);
        fetchedGameIdsRef.current.clear(); // Clear the fetched game IDs set
        const response = await fetch(
          "http://ec2-3-145-75-212.us-east-2.compute.amazonaws.com:3000/getUser",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username: user.username }),
          }
        );
        const data = await response.json();

        if (!response.ok) {
          const message =
            data.message || "Could not find the username in the database";
          throw new Error(message);
        }

        if (data.success) {
          setUserData(data.user);
          await fetchPlayerGames(data.user.gameIds);
          setRender(true);

          const end = performance.now();
          const elapsedTime = end - start;
          console.log(`Elapsed time: ${elapsedTime} milliseconds`);
        } else {
          throw new Error(data.message || "Network response was not ok");
        }
      } catch (error) {
        console.error("Caught error", error.message);
      }
    };
    getUser();
  }, [user.username]);

  const fetchPlayerGames = async (gameIds) => {
    try {
      setGames([]);
      fetchedGameIdsRef.current.clear(); // Clear the fetched game IDs set
      const response = await fetch(
        "http://ec2-3-145-75-212.us-east-2.compute.amazonaws.com:3000/getPlayerGames",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: user.username,
            gameIds: gameIds,
          }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        const message =
          data.message || "Could not find the username in the database";
        throw new Error(message);
      }

      if (data.success) {
        const calculatePoints = (words) => {
          let totalPoints = 0;
          words.forEach((word) => {
            const points = POINTS[word.length] || 0;
            totalPoints += points;
          });
          return totalPoints;
        };

        const newGames = data.games.map((game) => ({
          ...game,
          points: calculatePoints(game.wordsFoundForThisPlay),
        }));
        const parseDate = (dateString) => {
          return parse(dateString, "MMMM d, yyyy, h:mm a", new Date());
        };

        newGames.sort((a, b) => {
          const dateA = parseDate(a.dateAndTimePlayedAt);
          const dateB = parseDate(b.dateAndTimePlayedAt);
          return dateB - dateA;
        });
        setGames(newGames);
      } else {
        throw new Error(data.message || "Network response was not ok");
      }
    } catch (error) {
      console.error("Caught error", error.message);
    }
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  const renderGameItem = (item) => {
    console.log("game!: ", item);
    if (item.hasPlayed) {
      return (
        <TouchableOpacity
          key={item.gameId}
          style={styles.button}
          onPress={() => {
            navigation.replace("EndGameScreen", {
              preferredBoardSize: preferredBoardSize,
              user: user,
              gameId: item.gameId,
            });
          }}
        >
          <View style={styles.gameItemContainer}>
            <View style={styles.boxSizeContainer}>
              <Text style={styles.boxSizeText}>
                {item.boardLength}x{item.boardLength}
              </Text>
            </View>
            <View style={styles.gameInfoContainer}>
              <Text style={styles.infoText}>{item.points} points</Text>
              <Text style={styles.infoText}>
                {item.wordsFoundForThisPlay.length} word
                {item.wordsFoundForThisPlay.length !== 1 ? "s" : ""}
              </Text>
              <Text style={styles.dateText}>{item.dateAndTimePlayedAt}</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity
          key={item.gameId}
          style={styles.button}
          onPress={() => {
            navigation.replace("EndGameScreen", {
              preferredBoardSize: preferredBoardSize,
              user: user,
              gameId: item.gameId,
            });
          }}
        >
          <View style={styles.gameItemContainer}>
            <View style={styles.boxSizeContainer}>
              <Text style={styles.boxSizeText}>
                {item.boardLength}x{item.boardLength}
              </Text>
            </View>
            <View style={styles.gameInfoContainer}>
              <Text style={styles.infoText}>
                You did not play this game yet lol
              </Text>
              <Text style={styles.dateText}>{item.dateAndTimePlayedAt}</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }
  };

  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentGames = games.slice(startIndex, endIndex);

  return userData && render ? (
    <View style={styles.container}>
      <Text>I should probably put stuff up here</Text>
      <View style={styles.listContainer}>
        {currentGames.map((game) => renderGameItem(game))}
      </View>
      <View style={styles.pagination}>
        <Button
          title="Back"
          onPress={handlePreviousPage}
          disabled={currentPage === 0}
          color="#a02f58" // Set button color
        />
        <Text style={styles.pageText}>Page {currentPage + 1}</Text>
        <Button
          title="Next"
          onPress={handleNextPage}
          disabled={endIndex >= games.length}
          color="#a02f58" // Set button color
        />
      </View>
      <View style={styles.navContainer}>
        <BottomNavBar
          navigation={navigation}
          preferredBoardSize={preferredBoardSize}
          user={user}
        />
      </View>
    </View>
  ) : (
    <View style={styles.container}>
      <View style={styles.navContainer}>
        <BottomNavBar
          navigation={navigation}
          preferredBoardSize={preferredBoardSize}
          user={user}
        />
      </View>
    </View>
  );
}

export default HistoryScreen;

const createStyles = (height, width) => {
  const circleDiameter = height * 0.07; // This can be adjusted to fit your design preferences
  return StyleSheet.create({
    navContainer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
    },
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#FBF4F6",
    },
    listContainer: {
      marginTop: height * 0.12,
      height: "57%",
      width: "80%",
      justifyContent: "top",
      borderWidth: 1, // Consistent border width
      borderColor: "#e0e0e0", // Matching the border color
      backgroundColor: "#f9f9f9", // Background color similar to gameItemContainer
      borderRadius: 10, // Rounded corners
      elevation: 3, // Shadow for Android
      shadowColor: "#000000", // Shadow color for iOS
      shadowOffset: { width: 0, height: 4 }, // Shadow offset for iOS
      shadowOpacity: 0.05, // Opacity of shadow for iOS
      shadowRadius: 8, // Blur radius for iOS
      padding: 10, // Internal spacing
    },
    button: {
      backgroundColor: "#f7f7f7",
      padding: 2,
      marginVertical: 2,
      borderRadius: 5,
      justifyContent: "center",
      alignItems: "center",
    },
    gameItemContainer: {
      backgroundColor: "#f9f9f9",
      borderWidth: 1,
      borderColor: "#e0e0e0",
      flexDirection: "row",
      alignItems: "center",
      height: height * 0.1,
      elevation: 3, // This adds shadow on Android, similar to box-shadow
      shadowColor: "#000000", // Shadow color for iOS
      shadowOffset: { width: 0, height: 4 }, // Shadow offset for iOS, similar to the horizontal and vertical offsets in CSS
      shadowOpacity: 0.05, // Opacity of shadow for iOS
      shadowRadius: 8, // Blur radius for iOS
      borderRadius: 10, // Rounded corners
      padding: 10, // Internal spacing
    },
    boxSizeContainer: {
      width: circleDiameter,
      height: circleDiameter, // Make the height equal to the width
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f0f0f0",
      borderRadius: 15, // This will make it a perfect circle
    },
    boxSizeText: {
      fontSize: 24,
      color: "#a02f58",
      fontFamily: "San Francisco",
    },
    gameInfoContainer: {
      flex: 3,
      alignItems: "flex-start", // Align items to the left of the container
      paddingLeft: width * 0.08,
    },
    pagination: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "80%",
      marginTop: height * 0.02,
      alignSelf: "center",
    },
    infoText: {
      fontSize: 16,
      textAlign: "center",
      color: "black", // Match the text color
      fontFamily: "SF-Pro",
      fontWeight: "600", // Semi-bold weight
      letterSpacing: -0.5, // Reducing letter spacing
      lineHeight: 20, // You might need to adjust this based on your font size
      color: "#333", // Dark gray color for the text
    },
    dateText: {
      marginTop: height * 0.006,
      fontSize: 12,
      textAlign: "center",
      color: "black", // Match the text color
      fontFamily: "SF-Thin",
    },
    pageText: {
      fontSize: 20,
      fontFamily: "SF-Thin",
      color: "black", // Match the text color
    },
  });
};
