import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
} from "react-native";

const InviteButton = ({ friendsList, gameId }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const { width } = Dimensions.get("window");

  const addPlayerToGame = async () => {};
  const addGameToPlayer = async (username) => {
    try {
      const response = await fetch(
        "http://ec2-3-145-75-212.us-east-2.compute.amazonaws.com:3000/addGameToPlayer",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            gameId: gameId,
            username: username,
            hasPlayed: false,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to invite game to player");
      }

      if (data.success) {
        console.log("Game invited to player successfully");
      } else {
        console.log("Failed to invite game to player: ", data.message);
      }
    } catch (error) {
      console.error("Error inviting game to player: ", error.message);
    }
  };
  const renderModalItem = ({ item }) => (
    <TouchableOpacity
      style={styles.dropdownRow}
      onPress={() => {
        setModalVisible(false);
        addGameToPlayer(item);
      }}
    >
      <Text style={styles.dropdownRowText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.tab}
      >
        <Text style={styles.tabText}>Invite</Text>
      </TouchableOpacity>

      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { width: width * 0.6 }]}>
            <Text style={styles.modalViewWordsText}>Invite Friend</Text>
            <FlatList
              data={friendsList}
              renderItem={renderModalItem}
              keyExtractor={(item, index) => index.toString()}
            />
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  tab: {
    justifyContent: "center",
    padding: 10,
    backgroundColor: "#007bff",
    borderRadius: 5,
  },
  tabText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "100%",
  },
  modalViewWordsText: {
    fontSize: 18,
    marginBottom: 15,
  },
  dropdownRow: {
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#a02f58", // Match the background color
    borderRadius: 10,
    // borderWidth: 5,
  },
  dropdownRowText: {
    fontSize: 20,
    textAlign: "center",
    color: "#FBF4F6", // Match the text color
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#ccc",
    borderRadius: 5,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#000",
  },
});

export default InviteButton;
