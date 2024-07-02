import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from "react-native";
import BottomNavBar from "../components/BottomNavBar";

function ProfileScreen({ navigation, route }) {
  const { preferredBoardSize } = route.params;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const passwordInputRef = useRef(null);

  const handleUsernameSubmit = () => {
    Alert.alert("Form Submitted", `Username: ${username}`);
    if (isLogin) {
      return;
    } else {
      createAccount();
    }
    Keyboard.dismiss(); // Dismiss the keyboard
  };

  const toggleForm = () => {
    setIsLogin((prevIsLogin) => !prevIsLogin);
    setUsername("");
    setPassword("");

    const createAccount = async () => {
      try {
        const response = await fetch(
          "http://18.222.167.11:3000/createAccount",
          {
            method: "POST", // Use POST method
            headers: {
              "Content-Type": "application/json", // Set the content type to JSON
            },
            body: JSON.stringify({ username, password }), // Convert the username and password to a JSON string
          }
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        console.log("Response: ", response);
      } catch (error) {
        console.error("User Already Exists", error);
      }
    };
  };

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
          autoComplete="off"
          textContentType="none"
          placeholderTextColor="#999"
          returnKeyType="next"
          onSubmitEditing={() => passwordInputRef.current.focus()}
        />
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
          placeholderTextColor="#999"
          returnKeyType="done"
          onSubmitEditing={handleUsernameSubmit}
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
    width: "80%",
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