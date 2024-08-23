import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Pressable,
  ScrollView,
  Animated,
} from "react-native";
import { parse, set } from "date-fns";
import BottomNavBar from "../components/BottomNavBar";
import POINTS from "../data/point-distribution";
import COLORS from "../data/color";
import LoadingScreen from "./LoadingScreen";
import ToggleSwitch from "../components/ToggleSwitch";
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Swipeable from "react-native-gesture-handler/Swipeable";
import * as Font from "expo-font";

const ITEMS_PER_PAGE = 8;

function HomeScreen({ navigation, route }) {
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
  const [activeIndex, setActiveIndex] = useState(0);

  const animationValues = useRef({}).current;

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

    // Initialize animation value for each game item if not already initialized
    if (!animationValues[item.gameId]) {
      animationValues[item.gameId] = new Animated.Value(height * 0.11); // initial height
    }

    const rightSwipe = (progress, dragX) => {
      const scale = dragX.interpolate({
        inputRange: [-100, 0],
        outputRange: [1, 0.5],
        extrapolate: "clamp",
      });

      const removeGameWithAnimation = (gameId) => {
        Animated.timing(animationValues[gameId], {
          toValue: 0,
          duration: 200, // Animation duration (0.2 seconds)
          useNativeDriver: false,
        }).start(() => {
          const updatedGames = games.filter((game) => game.gameId !== gameId);
          setGames(updatedGames);
          setSelectedGames(updatedGames);
        });
      };

      return (
        <TouchableOpacity
          onPress={() => {
            removeGameWithAnimation(item.gameId);
          }}
          activeOpacity={0.6}
        >
          <View style={styles.deleteBox}>
            <Animated.View style={{ transform: [{ scale: scale }] }}>
              <FontAwesome name="trash" size={32} color="red" />
            </Animated.View>
          </View>
        </TouchableOpacity>
      );
    };

    return (
      <Animated.View
        key={item.gameId}
        style={{
          height: animationValues[item.gameId],
          marginBottom: animationValues[item.gameId].interpolate({
            inputRange: [0, height * 0.11],
            outputRange: [0, 10],
          }),
          overflow: "hidden", // Ensures content inside is hidden as height decreases
        }}
      >
        <Swipeable
          key={`swipeable-${item.gameId}`} // Unique key for Swipeable
          renderRightActions={(progress, dragX) =>
            rightSwipe(progress, dragX, item)
          }
          overshootLeft={false}
          closeOnScroll={true} // Automatically close on scroll
        >
          <TouchableOpacity
            key={`touchable-${item.gameId}`} // Unique key for TouchableOpacity
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
                <View style={styles.bookmarkIconContainer}>
                  <Pressable
                    key={item.gameId}
                    style={styles.bookmarkIcon}
                    onPress={() => editBookmark(item.gameId)}
                  >
                    <FontAwesome
                      name={bookmarkIcon}
                      size={24}
                      color={COLORS.Primary}
                    />
                  </Pressable>
                </View>
                <Text style={styles.infoText}>{item.points} points</Text>
                <Text style={styles.infoText}>
                  {item.wordsFoundForThisPlay.length} word
                  {item.wordsFoundForThisPlay.length !== 1 ? "s" : ""}
                </Text>
                <Text style={styles.dateText}>{item.dateAndTimePlayedAt}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </Swipeable>
      </Animated.View>
    );
  };

  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentGames = selectedGames.slice(startIndex, endIndex);

  const data = [
    { id: "1", text: "Game 1" },
    { id: "2", text: "Game 2" },
    { id: "3", text: "Game 3" },
  ];

  const renderItem = ({ item, index }) => (
    <View
      style={[
        styles.item,
        index === 0 ? { marginLeft: (width - width * 0.7) / 2 } : {},
        index === data.length - 1
          ? { marginRight: (width - width * 0.7) / 2 }
          : { marginHorizontal: (width - width * 0.7) / 2 },
      ]}
    >
      <Text style={styles.itemText}>{item.text}</Text>
    </View>
  );

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / (width * 0.7 + width * 0.1));
    setActiveIndex(index);
  };

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
    <View style={styles.outerContainer}>
      <ScrollView
        style={styles.scrollable}
        contentContainerStyle={{
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: height * 0.12,
        }}
      >
        <View style={styles.flatListContainer}>
          <FlatList
            horizontal={true}
            data={data}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              alignItems: "center",
              justifyContent: "center",
            }}
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            pagingEnabled
          />
          <View style={styles.paginationDots}>
            {data.map((_, index) => (
              <View
                key={index}
                style={index === activeIndex ? styles.activeDot : styles.dot}
              />
            ))}
          </View>
        </View>

        <View style={styles.outerListContainer}>
          <View style={styles.gamesHeader}>
            <Text style={styles.historyText}>Play</Text>
          </View>

          <View style={styles.gamesHeader}>
            <Text style={styles.historyText}>Recent Games</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.replace("HistoryScreen", {
                  preferredBoardSize: preferredBoardSize,
                  user: user,
                })
              }
            >
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.listContainer}>
            {currentGames.map((game) => renderGameItem(game))}
          </View>
        </View>
      </ScrollView>
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

export default HomeScreen;

const createStyles = (height, width) => {
  const circleDiameter = height * 0.07;
  return StyleSheet.create({
    navContainer: {
      height: "10%", // 10% of the screen height
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: COLORS.Neutral, // Ensure the background color matches
    },
    outerContainer: {
      flex: 1,
      width: "100%",
      alignItems: "center",
      justifyContent: "flex-start",
      backgroundColor: COLORS.Neutral,
      position: "relative",
    },
    scrollable: {
      flex: 1,
      width: "100%",
    },
    container: {
      flex: 1,
      width: "100%",
      backgroundColor: COLORS.Neutral,
    },
    outerListContainer: {
      marginTop: height * 0.03,
      width: "90%",
      justifyContent: "flex-start",
      backgroundColor: "#f9f9f9",
      backgroundColor: "transparent",
      // borderRadius: 30,
      // elevation: 3,
      // shadowColor: "#000000",
      // shadowOffset: { width: 0, height: 4 },
      // shadowOpacity: 0.05,
      // shadowRadius: 8,
      // borderWidth: 5,
      // borderColor: "purple",
      // borderWidth: 1,
      // borderColor: "#e0e0e0",
    },
    listContainer: {
      width: "100%",
      justifyContent: "flex-start",
      backgroundColor: "transparent",
      padding: 10,
    },
    button: {
      backgroundColor: "transparent",
      padding: 2,
      // marginVertical: 3,
      borderRadius: 5,
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      // marginVertical: 5,
      // borderWidth: 1,
    },
    gameItemContainer: {
      width: "100%",
      backgroundColor: "transparent",
      // borderWidth: 1,
      borderColor: "#e0e0e0",
      flexDirection: "row",
      alignItems: "center",
      height: height * 0.11,
      elevation: 3,
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      borderRadius: 20,
      // padding: 10,
      // borderWidth: 1,
    },
    boxSizeContainer: {
      width: circleDiameter,
      height: circleDiameter,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#DADADA",
      borderRadius: 15,
    },
    boxSizeText: {
      fontSize: 24,
      color: COLORS.Primary,
      fontFamily: "SF-Pro",
    },
    gameInfoContainer: {
      flex: 3,
      alignItems: "flex-start",
      paddingLeft: width * 0.08,
      // borderWidth: 1,
    },
    paginationDots: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 4,
      marginHorizontal: 6,
      backgroundColor: "#e0e0e0",
    },
    activeDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginHorizontal: 6,
      backgroundColor: COLORS.Primary,
    },
    infoText: {
      fontSize: 16,
      textAlign: "center",
      color: COLORS.Darker,
      fontFamily: "SF-Pro",
      fontWeight: "600",
      letterSpacing: -0.5,
      lineHeight: 20,
      color: COLORS.Darker,
    },
    inviterText: {
      fontSize: 16,
      textAlign: "center",
      color: COLORS.Darker,
      fontFamily: "SF-Pro",
      fontWeight: "600",
      letterSpacing: -0.5,
      lineHeight: 20,
      color: COLORS.Primary,
    },
    dateText: {
      marginTop: height * 0.008,
      fontSize: 12,
      lineHeight: 15,
      textAlign: "center",
      color: COLORS.Lighter,
      fontFamily: "SF-Thin",
    },
    pageText: {
      fontSize: 20,
      fontFamily: "SF-Thin",
      color: COLORS.Darker,
    },
    linkText: {
      fontSize: 16,
      color: COLORS.Primary,
      textDecorationLine: "underline",
      fontFamily: "SF-Pro",
      marginTop: 10,
    },
    bookmarkIcon: {
      paddingRight: 20,
    },
    gamesHeader: {
      height: height * 0.06,
      marginTop: height * 0.02,
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
    },
    flatListContainer: {
      height: height * 0.25,
      marginTop: height * 0.1,
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    item: {
      width: width * 0.7,
      height: height * 0.2,
      padding: 20,
      backgroundColor: COLORS.Neutral,
      borderRadius: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 3,
      justifyContent: "center",
      alignItems: "center",
      marginHorizontal: (width - width * 0.7) / 4,
    },
    itemText: {
      fontSize: 18,
      color: COLORS.Darker,
    },
    gamesHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 10,
    },
    historyText: {
      fontSize: 24,
      fontWeight: "bold",
      color: COLORS.Darker,
      fontWeight: "600",
      letterSpacing: -0.5,
    },
    seeAllText: {
      fontSize: 16,
      color: COLORS.Lighter,
    },
    deleteBox: {
      backgroundColor: "transparent",
      justifyContent: "center",
      alignItems: "center",
      width: 70,
      height: "75%",
      borderRadius: 8,
      marginTop: 10,
    },
    bookmarkIconContainer: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
    },
  });
};
