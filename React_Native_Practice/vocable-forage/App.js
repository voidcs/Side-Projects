import "react-native-get-random-values"; // Add this import
import { StatusBar } from "expo-status-bar";
import { StyleSheet, ActivityIndicator, View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import HomeScreen from "./screens/HomeScreen";
import PlayScreen from "./screens/PlayScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWordList = async () => {
      try {
        //http://172.16.102.180:3000
        const response = await fetch("http://18.222.167.11:3000");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.text(); // Use response.text() to handle plain text
        const wordsArray = result.split(/\r?\n/).filter((word) => word); // Split the response into an array of words
        setWords(wordsArray);
      } catch (error) {
        console.error("Error fetching word list", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWordList();
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
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: "#a02f58" },
            headerTintColor: "white",
          }}
        >
          <Stack.Screen
            name="HomeScreen"
            component={HomeScreen}
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
            initialParams={{ words }}
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
