import React, { useState, useRef, useEffect } from "react";
import { useFonts } from "expo-font";

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import COLORS from "../data/color";
import BottomNavBar from "../components/BottomNavBar";
import FriendsList from "../components/FriendsList";
import AsyncStorage from "@react-native-async-storage/async-storage";

function ProfileScreen({ navigation, route }) {
  useFonts({
    "SF-Thin": require("../assets/fonts/SF-Pro-Text-Thin.otf"),
    "SF-Pro": require("../assets/fonts/SF-Pro.ttf"),
  });
  const storeUserToken = async (token) => {
    try {
      await AsyncStorage.setItem("player", token);
    } catch (e) {
      console.error("Failed to save the token", e);
    }
  };
  const { preferredBoardSize, user } = route.params;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (user) {
      const getUser = async () => {
        try {
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
            console.log("User data fetched successfully");
          } else {
            throw new Error(data.message || "Network response was not ok");
          }
        } catch (error) {
          console.error("Caught error", error.message);
        }
      };
      getUser();
      storeUserToken(JSON.stringify(user));
      setUserData(user);
    }
  }, []);

  const passwordInputRef = useRef(null);

  const handleUsernameSubmit = () => {
    const attemptLogin = async () => {
      try {
        const response = await fetch(
          "http://ec2-3-145-75-212.us-east-2.compute.amazonaws.com:3000/attemptLogin",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
          }
        );
        const data = await response.json();

        if (!response.ok) {
          const message = data.message || "Network response was not ok";
          throw new Error(message);
        }

        if (data.success) {
          console.log("Login successful");
          setUserData(data.user);
          storeUserToken(JSON.stringify(data.user));
        } else {
          throw new Error(data.message || "Network response was not ok");
        }
      } catch (error) {
        console.error("Caught error", error.message);
      }
    };

    const createAccount = async () => {
      try {
        const response = await fetch(
          "http://ec2-3-145-75-212.us-east-2.compute.amazonaws.com:3000/createAccount",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
          }
        );
        const data = await response.json();
        console.log("Data: ", data);
        if (data.success) {
          console.log("Added account");
          setUserData(data.user);
          console.log("account: ", data.user);
        } else {
          throw new Error(data.message || "Network response was not ok");
        }
      } catch (error) {
        console.error(error);
      }
    };

    if (isLogin) {
      attemptLogin();
    } else {
      createAccount();
    }
    Keyboard.dismiss(); // Dismiss the keyboard
  };

  const toggleForm = () => {
    setIsLogin((prevIsLogin) => !prevIsLogin);
    setUsername("");
    setPassword("");
  };

  if (userData) {
    const addFriend = (newFriend) => {
      userData.friends.push(newFriend);
      setUserData(userData);
      console.log("friends: ", userData.friends);
    };
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          Oi bruv, you're logged in {userData.username}
        </Text>

        <FriendsList
          friends={userData.friends}
          addFriend={addFriend}
          user={userData}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setUserData(null);
            storeUserToken(JSON.stringify(null));
          }}
        >
          <Text style={styles.buttonText}>Log Out</Text>
        </TouchableOpacity>
        <View style={styles.navContainer}>
          <BottomNavBar
            navigation={navigation}
            preferredBoardSize={preferredBoardSize}
            user={userData}
          />
        </View>
      </View>
    );
  }
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>{isLogin ? "Login" : "Create Account"}</Text>
        <Text style={[styles.title, { fontSize: 14 }]}>
          Dw bro the password is hashed, I can't see it 💀
        </Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your username"
            value={username}
            onChangeText={setUsername}
            autoCorrect={false}
            spellCheck={false}
            autoComplete="off"
            textContentType="none"
            keyboardType="default"
            placeholderTextColor="#999"
            autoCapitalize="none"
            returnKeyType="next"
            onSubmitEditing={() => passwordInputRef.current.focus()}
            clearButtonMode="while-editing"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            ref={passwordInputRef}
            style={styles.input}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCorrect={false}
            spellCheck={false}
            autoComplete="off"
            textContentType="none"
            keyboardType="default"
            placeholderTextColor="#999"
            returnKeyType="done"
            clearButtonMode="while-editing"
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={handleUsernameSubmit}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleForm}>
          <Text style={styles.toggleText}>
            {isLogin
              ? "Need to create an account?"
              : "Already have an account?"}
          </Text>
        </TouchableOpacity>
        <View style={styles.navContainer}>
          <BottomNavBar
            navigation={navigation}
            preferredBoardSize={preferredBoardSize}
            user={userData}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

export default ProfileScreen;

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
    backgroundColor: COLORS.Secondary,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: COLORS.Primary,
  },
  inputContainer: {
    width: "70%",
    marginBottom: 20,
  },
  label: {
    color: COLORS.Primary,
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    height: 50,
    borderColor: COLORS.Primary,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
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
  button: {
    backgroundColor: COLORS.Primary,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 40,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  toggleText: {
    color: COLORS.Primary,
    marginTop: 20,
    fontSize: 16,
  },
});
