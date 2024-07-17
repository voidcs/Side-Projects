import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import COLORS from "../data/color";
import BottomNavBar from "../components/BottomNavBar";
import FriendsList from "../components/FriendsList";
import AsyncStorage from "@react-native-async-storage/async-storage";

function ProfileScreen({ navigation, route }) {
  const storeUserToken = async (token) => {
    try {
      await AsyncStorage.setItem("player", token);
    } catch (e) {
      // saving error
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
        const start = performance.now();
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
            const end = performance.now();
            const elapsedTime = end - start;
            // console.log(`Elapsed time: ${elapsedTime} milliseconds`);
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
  console.log(user.friends);
  const passwordInputRef = useRef(null);

  const handleUsernameSubmit = () => {
    const attemptLogin = async () => {
      try {
        const response = await fetch(
          "http://ec2-3-145-75-212.us-east-2.compute.amazonaws.com:3000/attemptLogin",
          {
            method: "POST", // Use POST method
            headers: {
              "Content-Type": "application/json", // Set the content type to JSON
            },
            body: JSON.stringify({ username, password }), // Convert the username and password to a JSON string
          }
        );
        const data = await response.json(); // Parse the JSON response

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
            method: "POST", // Use POST method
            headers: {
              "Content-Type": "application/json", // Set the content type to JSON
            },
            body: JSON.stringify({ username, password }), // Convert the username and password to a JSON string
          }
        );
        const data = await response.json(); // Parse the JSON response
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
    // userData.friends = ["JJ", "Becca", "Alan"];
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
        <Text style={styles.subtitle}>
          {/* Game IDs: {userData.gameIds.join(", ")} */}
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setUserData(null);
            storeUserToken(JSON.stringify(null));
          }} // Log out button to clear userData
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
        <TextInput
          style={styles.input}
          placeholder="Enter your username"
          value={username}
          onChangeText={setUsername}
          autoCorrect={false}
          spellCheck={false}
          autoComplete="off" // Explicitly turn off autocomplete
          textContentType="none" // Ensure no content type association for autofill
          keyboardType="default" // Use default keyboard without any smart suggestions
          placeholderTextColor="#999"
          autoCapitalize="none"
          returnKeyType="next" // Sets the return key to 'Next'
          onSubmitEditing={() => passwordInputRef.current.focus()} // Focus the password input on submit
          clearButtonMode="while-editing"
        />

        <TextInput
          ref={passwordInputRef}
          style={styles.input}
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry // Ensures the text entry is obscured
          autoCorrect={false} // Turn off autocorrect
          spellCheck={false} // Disable spell checking
          autoComplete="off" // Explicitly turn off autocomplete
          textContentType="none" // Ensure no content type association for autofill
          keyboardType="default" // Use default keyboard which does not adapt to context
          placeholderTextColor="#999"
          returnKeyType="done" // Sets the return key to 'Done'
          clearButtonMode="while-editing"
        />
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
  input: {
    height: 50,
    borderColor: COLORS.Primary,
    borderWidth: 1,
    borderRadius: 10,
    width: "70%",
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: "#fff",
    fontSize: 16,
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
    // textDecorationLine: "underline",
  },
});
