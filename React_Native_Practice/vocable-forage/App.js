import { StatusBar } from "expo-status-bar";
import { StyleSheet, ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useEffect, useState } from 'react';
import HomeScreen from "./screens/HomeScreen";
import PlayScreen from "./screens/PlayScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const readWordList = async () => {
      try {
        const s3Url = 'https://my-word-list-bucket.s3.amazonaws.com/filtered-word-list.txt'; // Replace with your S3 URL
        const response = await fetch(s3Url);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const fileContent = await response.text();
        const wordsArray = fileContent.split(/\r?\n/).filter(word => word);
        setWords(wordsArray);
        // console.log('Words length:', wordsArray.length);
      } catch (error) {
        console.error('Error fetching file', error);
      } finally {
        setLoading(false);
      }
    };

    readWordList();
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
            headerStyle: { backgroundColor: "#2196F3" },
            headerTintColor: "white",
          }}
        >
          <Stack.Screen
            name="HomeScreen"
            component={HomeScreen}
            options={{
              title: "Vocable Forage",
            }}
          />
          <Stack.Screen
            name="PlayScreen"
            component={PlayScreen}
            options={{
              title: "Hunt Words I Guess",
              headerBackTitle: "Back",
              gestureEnabled: false, // Disable the swipe-to-go-back gesture
            }}
            initialParams={{ words }} // Pass words as initialParams
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
});
