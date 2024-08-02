import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  TextInput,
  Button,
  Modal,
  TouchableOpacity,
} from "react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

const FriendsList = ({ friends, addFriend, user }) => {
  const { height, width } = Dimensions.get("window");
  const styles = createStyles(height, width);
  const [newFriend, setNewFriend] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const handleAddFriend = async () => {
    if (newFriend.trim()) {
      try {
        const response = await fetch(
          "http://ec2-3-145-75-212.us-east-2.compute.amazonaws.com:3000/addFriend",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: user.username,
              friendname: newFriend,
            }),
          }
        );
        const data = await response.json();

        if (!response.ok) {
          const message =
            data.message || "Could not find the username in the database";
          throw new Error(message);
        }

        console.log("data? ", data.success);
        if (data.success) {
          console.log("succeeded");
          addFriend(newFriend);
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        console.error("Caught error", error.message);
      }
      setNewFriend("");
      setModalVisible(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.friendItem}>
      <Text style={styles.friendText}>{item}</Text>
    </View>
  );

  return (
    <View style={styles.outerContainer}>
      <Text style={styles.header}>Friends</Text>

      <FlatList
        showsVerticalScrollIndicator={false}
        bounces={false}
        data={friends}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        style={styles.container}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>
            You don't have any friends added.
          </Text>
        )}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>Add Friend</Text>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TextInput
              style={styles.input}
              onChangeText={setNewFriend}
              value={newFriend}
              autoFocus={true}
              placeholder="Enter your friend's name"
              autoCorrect={false}
              spellCheck={false}
              autoComplete="off" // Explicitly turn off autocomplete
              textContentType="none" // Ensure no content type association for autofill
              keyboardType="default" // Use default keyboard without any smart suggestions
              placeholderTextColor="#999"
              autoCapitalize="none"
              returnKeyType="done" // Sets the return key to 'Next'
              clearButtonMode="while-editing"
            />
            <Button title="Add" onPress={handleAddFriend} />
            <Button
              title="Cancel"
              color="red"
              onPress={() => setModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const createStyles = (height, width) =>
  StyleSheet.create({
    outerContainer: {
      height: height * 0.37,
      width: "80%",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 20,
    },
    container: {
      width: "100%",
    },
    listContainer: {
      flexGrow: 1,
      padding: 10,
    },
    friendItem: {
      padding: 10,
      marginTop: 5,
      backgroundColor: "#ffffff",
      borderWidth: 1,
      borderColor: "#cccccc",
      borderRadius: 5,
    },
    friendText: {
      fontSize: 16,
      fontFamily: "Inter_400Regular",
    },
    emptyText: {
      fontSize: 16,
      color: "#666666",
      padding: 20,
      textAlign: "center",
    },
    addButton: {
      backgroundColor: "#007bff",
      padding: 10,
      borderRadius: 5,
      marginTop: 20,
    },
    addButtonText: {
      color: "#ffffff",
      fontSize: 16,
    },
    centeredView: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 22,
    },
    modalView: {
      margin: 20,
      backgroundColor: "white",
      borderRadius: 20,
      padding: 35,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    input: {
      height: 40,
      width: 250,
      marginVertical: 10,
      borderWidth: 1,
      padding: 10,
    },
    header: {
      fontSize: 20,
      fontWeight: "bold",
      paddingVertical: 10, // Adds vertical padding around the text
      color: "#333333", // Dark gray color for the header text
    },
  });

export default FriendsList;
