import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Button,
  Dimensions,
  Pressable,
} from "react-native";
import { parse, set } from "date-fns";
import BottomNavBar from "../components/BottomNavBar";
import POINTS from "../data/point-distribution";
import COLORS from "../data/color";
import LoadingScreen from "./LoadingScreen";
import ToggleSwitch from "../components/ToggleSwitch";
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Font from "expo-font";

const ITEMS_PER_PAGE = 5;

function HistoryScreen({ navigation, route }) {
  const { preferredBoardSize, user } = route.params;
  const { height, width } = Dimensions.get("window");
  const styles = createStyles(height, width);

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [makeAccount, setMakeAccount] = useState(false);
  const [games, setGames] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [render, setRender] = useState(false);
  const [bookmarkedGames, setBookmarkedGames] = useState([]);
  const [selected, setSelected] = useState("All Games");
  const [selectedGames, setSelectedGames] = useState([]);
  const fetchedGameIdsRef = useRef(new Set());

  useEffect(() => {
    // const loadFonts = async () => {
    //   await Font.loadAsync({
    //     "SF-Pro": require("../assets/fonts/SF-Pro.ttf"),
    //     "SF-Thin": require("../assets/fonts/SF-Thin.ttf"),
    //   });
    //   setFontsLoaded(true);
    // };

    // loadFonts();
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
    setLoading(false);
    if (user != null) getUser();
    else {
      setMakeAccount(true);
    }
    const getBookmarkedGames = async () => {
      try {
        const bookmarkedGames = await AsyncStorage.getItem("bookmarkedGames");
        if (bookmarkedGames !== null) {
          return JSON.parse(bookmarkedGames);
        } else {
          await AsyncStorage.setItem("bookmarkedGames", JSON.stringify([]));
          return [];
        }
      } catch (e) {
        console.error("Failed to retrieve or create bookmarkedGames", e);
        return [];
      }
    };
    getBookmarkedGames().then((bookmarks) => {
      setBookmarkedGames(bookmarks);
    });
  }, [user]);

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
        newGames.reverse();
        setGames(newGames);
        setSelectedGames(newGames);
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

  const editBookmark = async (gameId) => {
    console.log("gameId in bookmark: ", gameId);
    console.log("my bookmarked: ", bookmarkedGames);

    let updatedBookmarks = [...bookmarkedGames];
    const index = updatedBookmarks.indexOf(gameId);

    if (index > -1) {
      updatedBookmarks.splice(index, 1);
    } else {
      updatedBookmarks.push(gameId);
    }

    await AsyncStorage.setItem(
      "bookmarkedGames",
      JSON.stringify(updatedBookmarks)
    );
    setBookmarkedGames(updatedBookmarks);
  };

  const renderGameItem = (item) => {
    const isBookmarked = bookmarkedGames.includes(item.gameId);
    const bookmarkIcon = isBookmarked ? "heart" : "heart-o";
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
              <Pressable
                style={styles.bookmarkIcon}
                onPress={() => editBookmark(item.gameId)}
              >
                <FontAwesome
                  name={bookmarkIcon}
                  size={20}
                  color={COLORS.Primary}
                />
              </Pressable>
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
            navigation.replace("PlayScreen", {
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
                Invited by{" "}
                <Text style={styles.inviterText}>{item.inviter}</Text>
              </Text>
              <Text style={styles.dateText}>{item.dateAndTimePlayedAt}</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }
  };

  const setSelectedHandler = (selection) => {
    setCurrentPage(0);
    if (selection === "Favorites") {
      // console.log("book: ", bookmarkedGames);
      const bookmarkedGamesSet = new Set(bookmarkedGames);
      const filteredGames = games.filter((game) =>
        bookmarkedGamesSet.has(game.gameId)
      );
      setSelectedGames(filteredGames);
    } else {
      // console.log("working: ", games[0]);
      setSelectedGames(games);
    }
    // console.log("current page: ", currentPage);
    setSelected(selection);
  };
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentGames = selectedGames.slice(startIndex, endIndex);
  if (!userData && makeAccount) {
    return (
      <View style={styles.container}>
        <Text style={styles.infoText}>You don't have any history yet.</Text>
        <TouchableOpacity
          onPress={() =>
            navigation.replace("ProfileScreen", {
              preferredBoardSize: preferredBoardSize,
              user: null,
            })
          }
        >
          <Text style={styles.linkText}>Create an account</Text>
        </TouchableOpacity>
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

  return userData && render ? (
    <View style={styles.container}>
      <View style={styles.toggleSwitch}>
        <ToggleSwitch
          bookmarkedGames={bookmarkedGames}
          setGames={setGames}
          selected={selected}
          setSelectedHandler={setSelectedHandler}
        />
      </View>

      <View style={styles.listContainer}>
        {currentGames.map((game) => renderGameItem(game))}
      </View>
      <View style={styles.pagination}>
        <Button
          title="Back"
          onPress={handlePreviousPage}
          disabled={currentPage === 0}
          color={COLORS.Primary} // Set button color
        />
        <Text style={styles.pageText}>Page {currentPage + 1}</Text>
        <Button
          title="Next"
          onPress={handleNextPage}
          disabled={endIndex >= selectedGames.length}
          color={COLORS.Primary} // Set button color
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
      <LoadingScreen />

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
  const circleDiameter = height * 0.07;
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
      backgroundColor: COLORS.Secondary,
    },
    listContainer: {
      // marginTop: height * 0.12,
      marginTop: height * 0.02,
      height: "57%",
      width: "80%",
      justifyContent: "top",
      borderWidth: 1,
      borderColor: "#e0e0e0",
      backgroundColor: "#f9f9f9",
      borderRadius: 10,
      elevation: 3,
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      padding: 10,
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
      elevation: 3,
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      borderRadius: 10,
      padding: 10,
    },
    boxSizeContainer: {
      width: circleDiameter,
      height: circleDiameter,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f0f0f0",
      borderRadius: 15,
    },
    boxSizeText: {
      fontSize: 24,
      color: COLORS.Primary,
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
      color: "black",
      fontFamily: "SF-Pro",
      fontWeight: "600",
      letterSpacing: -0.5, // Reducing letter spacing
      lineHeight: 20,
      color: "#333",
    },
    inviterText: {
      fontSize: 16,
      textAlign: "center",
      color: "black",
      fontFamily: "SF-Pro",
      fontWeight: "600",
      letterSpacing: -0.5, // Reducing letter spacing
      lineHeight: 20,
      color: COLORS.Primary,
      // textDecorationLine: "underline",
    },
    dateText: {
      marginTop: height * 0.006,
      fontSize: 12,
      textAlign: "center",
      color: "black",
      fontFamily: "SF-Thin",
    },
    pageText: {
      fontSize: 20,
      fontFamily: "SF-Thin",
      color: "black",
    },
    linkText: {
      fontSize: 16,
      color: COLORS.Primary,
      textDecorationLine: "underline",
      fontFamily: "SF-Pro",
      marginTop: 10,
    },
    bookmarkIcon: {
      paddingRight: 8,
      paddingTop: 15,
      position: "absolute",
      top: 0,
      right: 0,
    },
    toggleSwitch: {
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
  });
};
