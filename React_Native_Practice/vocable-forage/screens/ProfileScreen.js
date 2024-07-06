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
import BottomNavBar from "../components/BottomNavBar";

function ProfileScreen({ navigation, route }) {
  const { preferredBoardSize, user } = route.params;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [userData, setUserData] = useState(null);
  useEffect(() => {
    if (user) {
      setUserData(user);
    }
  }, [user]);
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
          console.log("Login successful", data.user);
          setUserData(data.user);
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
    // Render a different component or page when userData is not null
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome, {userData.username}</Text>
        <Text style={styles.subtitle}>
          Friends: {userData.friends.join(", ")}
        </Text>
        <Text style={styles.subtitle}>
          {/* Game IDs: {userData.gameIds.join(", ")} */}
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setUserData(null)} // Log out button to clear userData
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
    backgroundColor: "#FBF4F6",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#a02f58",
  },
  input: {
    height: 50,
    borderColor: "#a02f58",
    borderWidth: 1,
    borderRadius: 10,
    width: "70%",
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#a02f58",
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
    color: "#a02f58",
    marginTop: 20,
    fontSize: 16,
    // textDecorationLine: "underline",
  },
});
