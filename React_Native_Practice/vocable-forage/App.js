import "react-native-get-random-values"; // Add this import
import { StatusBar } from "expo-status-bar";
import { StyleSheet, ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import HomeScreen from "./screens/HomeScreen";
import PlayScreen from "./screens/PlayScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trie, setTrie] = useState(null);

  useEffect(() => {
    const fetchWordList = async () => {
      try {
        const response = await fetch("http://18.222.167.11:3000/words");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.text();
        const wordsArray = result.split(/\r?\n/).filter((word) => word);
        setWords(wordsArray);
      } catch (error) {
        console.error("Error fetching word list", error);
      }
    };

    const fetchTrie = async () => {
      try {
        const response = await fetch("http://18.222.167.11:3000/trie");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        console.log("result: ", result);
        setTrie(result);
        console.log("Trie: ", trie);
      } catch (error) {
        console.error("Error fetching trie", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWordList();
    fetchTrie();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: "#a02f58" },
            headerTintColor: "white",
            headerShown: false,
          }}
        >
          <Stack.Screen
            name="HomeScreen"
            component={HomeScreen}
            initialParams={{ words }}
            options={{
              title: "",
            }}
          />
          <Stack.Screen
            name="PlayScreen"
            component={PlayScreen}
            options={{
              title: "",
              headerBackTitleVisible: false,
              headerBackTitle: "back",
              gestureEnabled: false,
            }}
            initialParams={{ words, trie }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
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
