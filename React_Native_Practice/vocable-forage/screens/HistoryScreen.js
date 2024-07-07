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

        setGames(
          newGames.sort(
            (a, b) =>
              new Date(b.dateAndTimePlayedAt) - new Date(a.dateAndTimePlayedAt)
          )
        );
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
      <Text style={styles.infoText}>{item.dateAndTimePlayedAt}</Text>
      <Text style={styles.infoText}>Points: {item.points}</Text>
      <Text style={styles.infoText}>
        Words: {item.wordsFoundForThisPlay.length}
      </Text>
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
            color="#a02f58" // Set button color
          />
          <Text>Page {currentPage + 1}</Text>
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
