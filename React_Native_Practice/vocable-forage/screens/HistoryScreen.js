import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Modal,
} from "react-native";
import BottomNavBar from "../components/BottomNavBar";

function HistoryScreen({ navigation, route }) {
  const { preferredBoardSize, user } = route.params;

  const [userData, setUserData] = useState(null);
  const [games, setGames] = useState([]);
  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await fetch(
          "http://ec2-3-145-75-212.us-east-2.compute.amazonaws.com:3000/getUser",
          {
            method: "POST", // Use POST method
            headers: {
              "Content-Type": "application/json", // Set the content type to JSON
            },
            body: JSON.stringify({ username: user.username }), // Convert the username and password to a JSON string
          }
        );
        const data = await response.json(); // Parse the JSON response

        if (!response.ok) {
          const message =
            data.message || "Could not find the username in the database";
          throw new Error(message);
        }

        if (data.success) {
          console.log("Login successful");
          console.log("user: ", data.user);
          setUserData(data.user);
          for (let i = 0; i < data.user.gameIds.length; i++) {
            let UUID = data.user.gameIds[i];
            console.log("UUID: ", UUID[0]);
            const response = await fetch(
              "http://ec2-3-145-75-212.us-east-2.compute.amazonaws.com:3000/getPlayerInGame",
              {
                method: "POST", // Use POST method
                headers: {
                  "Content-Type": "application/json", // Set the content type to JSON
                },
                body: JSON.stringify({
                  username: user.username,
                  gameId: UUID[0],
                }), // Convert the username and password to a JSON string
              }
            );
            const gameData = await response.json(); // Parse the JSON response
            if (gameData.success) {
              console.log("words for: ", gameData.player);
            }
            // const res = await getPlayerInGame(IIUD);
            // give it the gameId and the username
            // Check for data.user.gameIds[i]
          }
        } else {
          throw new Error(data.message || "Network response was not ok");
        }
      } catch (error) {
        console.error("Caught error", error.message);
      }
    };
    getUser();
  }, []);

  return (
    userData && (
      <View style={styles.container}>
        <Text>{userData.gameIds}</Text>
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

const styles = StyleSheet.create({
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
    paddingHorizontal: 20,
  },
});
