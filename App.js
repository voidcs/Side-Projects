import "react-native-get-random-values"; // Add this import
import { StatusBar } from "expo-status-bar";
import { StyleSheet, ActivityIndicator, View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import HomeScreen from "./screens/HomeScreen";
import PlayScreen from "./screens/PlayScreen";
import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } from "@env";

const Stack = createNativeStackNavigator();

// Initialize the S3 client
const s3Client = new S3Client({
  region: "us-east-2", // Replace with your S3 bucket region
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID, // Replace with your access key ID
    secretAccessKey: AWS_SECRET_ACCESS_KEY, // Replace with your secret access key
  },
});

const getObjectFromS3 = async (bucket, key) => {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  const response = await fetch(signedUrl);
  const fileContent = await response.text();
  return fileContent;
};

export default function App() {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverMessage, setServerMessage] = useState("");

  useEffect(() => {
    const readWordList = async () => {
      try {
        const bucket = "my-word-list-bucket"; // Replace with your S3 bucket name
        const key = "filtered-word-list.txt"; // Replace with your S3 object key
        const fileContent = await getObjectFromS3(bucket, key);
        const wordsArray = fileContent.split(/\r?\n/).filter((word) => word);
        setWords(wordsArray);
      } catch (error) {
        console.error("Error fetching file", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchServerMessage = async () => {
      try {
        //http://172.31.1.36:3000
        const response = await fetch("http://172.31.1.36:3000");
        const result = await response.text();
        setServerMessage(result);
      } catch (error) {
        console.error("Error fetching server message", error);
      }
    };

    readWordList();
    fetchServerMessage();
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
      <View style={styles.messageContainer}>
        <Text>{serverMessage}</Text>
      </View>
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
