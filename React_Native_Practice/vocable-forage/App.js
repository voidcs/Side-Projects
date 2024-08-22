import "react-native-get-random-values"; // Add this import
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  ActivityIndicator,
  View,
  Text,
  Performance,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import HomeScreen from "./screens/HomeScreen";
import PlayScreen from "./screens/PlayScreen";
import EndGameScreen from "./screens/EndGameScreen";
import ProfileScreen from "./screens/ProfileScreen";
import HistoryScreen from "./screens/HistoryScreen";
import SelectPlayScreen from "./screens/SelectPlayScreen";
import Trie from "trie-prefix-tree";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const Stack = createNativeStackNavigator();

export default function App() {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trie, setTrie] = useState(null);
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    const fetchWordList = async () => {
      try {
        const response = await fetch(
          "http://ec2-3-145-75-212.us-east-2.compute.amazonaws.com:3000/words"
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.text();
        const wordsArray = result.split(/\r?\n/).filter((word) => word);
        setWords(wordsArray);
      } catch (error) {
        console.error("Error fetching word list", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWordList();
    const getPlayer = async () => {
      try {
        const player = await AsyncStorage.getItem("player");
        if (player !== null) {
          return JSON.parse(player);
        }
        return null;
      } catch (e) {
        console.error("Failed to retrieve or create player", e);
        return null;
      }
    };

    const initializePlayer = async () => {
      const playerData = await getPlayer();
      setPlayer(playerData);
    };

    initializePlayer();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: "#a02f58" },
            headerTintColor: "white",
            headerShown: false,
            animation: "none",
          }}
        >
          <Stack.Screen
            name="HomeScreen"
            component={HomeScreen}
            options={{
              title: "",
            }}
            initialParams={{ preferredBoardSize: 5, user: player }}
          />
          <Stack.Screen
            name="PlayScreen"
            component={PlayScreen}
            options={{
              title: "",
            }}
          />
          <Stack.Screen
            name="SelectPlayScreen"
            component={SelectPlayScreen}
            options={{
              title: "",
            }}
          />
          <Stack.Screen
            name="EndGameScreen"
            component={EndGameScreen}
            options={{
              title: "",
            }}
          />
          <Stack.Screen
            name="HistoryScreen"
            component={HistoryScreen}
            options={{
              title: "",
            }}
          />
          <Stack.Screen
            name="ProfileScreen"
            component={ProfileScreen}
            options={{
              title: "",
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  messageContainer: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: "center",
  },
});
