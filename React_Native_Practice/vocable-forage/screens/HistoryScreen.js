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
import BottomNavBar from "../components/BottomNavBar";
import POINTS from "../data/point-distribution";

const ITEMS_PER_PAGE = 5;

function HistoryScreen({ navigation, route }) {
  const { preferredBoardSize, user } = route.params;
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
          await fetchMoreGames(data.user.gameIds.slice(0, ITEMS_PER_PAGE));
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

  const fetchMoreGames = async (gameIds) => {
    const fetchGameData = async (UUID) => {
      const response = await fetch(
        "http://ec2-3-145-75-212.us-east-2.compute.amazonaws.com:3000/getPlayerInGame",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: user.username,
            gameId: UUID[0],
          }),
        }
      );
      const gameData = await response.json();
      return { ...gameData, gameId: UUID[0] };
    };

    const gamePromises = gameIds
      .filter((id) => !fetchedGameIdsRef.current.has(id[0])) // Filter out already fetched game IDs
      .map(fetchGameData);

    const gameResults = await Promise.all(gamePromises);

    const newGames = gameResults
      .filter((gameData) => gameData.success)
      .map((gameData) => {
        const calculatePoints = (words) => {
          let totalPoints = 0;
          words.forEach((word) => {
            const points = POINTS[word.length] || 0;
            totalPoints += points;
          });
          return totalPoints;
        };

        const gameDate = new Date(gameData.player.dateAndTimePlayedAt);
        const now = new Date();
        const oneDay = 24 * 60 * 60 * 1000;
        let formattedDate;

        if (now.toDateString() === gameDate.toDateString()) {
          formattedDate = `Today at ${gameDate.toLocaleString("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          })}`;
        } else if (
          now.getTime() - gameDate.getTime() < oneDay &&
          now.getDay() !== gameDate.getDay()
        ) {
          formattedDate = `Yesterday at ${gameDate.toLocaleString("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          })}`;
        } else {
          formattedDate = gameDate.toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          });
        }

        return {
          ...gameData.player,
          dateAndTimePlayedAt: gameData.player.dateAndTimePlayedAt, // Store ISO string
          formattedDate: formattedDate,
          gameId: gameData.gameId,
          points: calculatePoints(gameData.player.wordsFoundForThisPlay),
        };
      });

    setGames((prevGames) => [
      ...prevGames,
      ...newGames.sort(
        (a, b) =>
          new Date(b.dateAndTimePlayedAt) - new Date(a.dateAndTimePlayedAt)
      ),
    ]);

    // Add the fetched game IDs to the set
    newGames.forEach((game) => fetchedGameIdsRef.current.add(game.gameId));
  };

  const handleNextPage = async () => {
    const nextPage = currentPage + 1;
    const startIndex = nextPage * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const nextGameIds = userData.gameIds.slice(startIndex, endIndex);

    await fetchMoreGames(nextGameIds);
    setCurrentPage(nextPage);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  const renderGameItem = ({ item }) => (
    <TouchableOpacity
      style={styles.button}
      onPress={() => {
        navigation.replace("EndGameScreen", {
          preferredBoardSize: preferredBoardSize,
          user: user,
          gameId: item.gameId,
        });
      }}
    >
      <Text style={styles.infoText}>{item.formattedDate}</Text>
      <Text style={styles.infoText}>Points: {item.points}</Text>
      <Text style={styles.infoText}>
        Words: {item.wordsFoundForThisPlay.length}
      </Text>
      {/* <Text style={styles.infoText}>Game ID: {item.gameId}</Text> */}
    </TouchableOpacity>
  );

  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentGames = games.slice(startIndex, endIndex);

  return (
    userData &&
    render && (
      <View style={styles.container}>
        <View style={styles.listContainer}>
          <FlatList
            data={currentGames}
            keyExtractor={(item) => item.gameId}
            renderItem={renderGameItem}
          />
        </View>
        <View style={styles.pagination}>
          <Button
            title="Back"
            onPress={handlePreviousPage}
            disabled={currentPage === 0}
          />
          <Text>Page {currentPage + 1}</Text>
          <Button
            title="Next"
            onPress={handleNextPage}
            disabled={endIndex >= userData.gameIds.length}
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
    )
  );
}

export default HistoryScreen;

const createStyles = (height, width) => {
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
      height: "60%",
      width: "80%",
      marginTop: height * 0.1,
      marginBottom: 20,
      borderWidth: 5,
      padding: width * 0.03,
    },
    button: {
      backgroundColor: "#a02f58",
      padding: 10,
      marginVertical: 5,
      borderRadius: 5,
      height: height * 0.1,
      justifyContent: "center",
      alignItems: "center",
    },
    pagination: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "80%",
      marginVertical: 10,
      alignSelf: "center",
    },
    infoText: {
      fontSize: 16,
      textAlign: "center",
      color: "#FBF4F6", // Match the text color
    },
  });
};
