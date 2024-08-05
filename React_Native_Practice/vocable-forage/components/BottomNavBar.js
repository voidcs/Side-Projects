import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Icon } from "react-native-elements";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import COLORS from "../data/color";
import { v4 as uuidv4 } from "uuid";

const BottomNavBar = ({ navigation, preferredBoardSize, user }) => {
  const { height, width } = Dimensions.get("window");
  const styles = createStyles(height, width);
  const route = useRoute();
  const getColor = (screenName) => {
    if (route.name === screenName) {
      return COLORS.Primary;
    }
    if (screenName === "PlayScreen" && route.name === "EndGameScreen") {
      return COLORS.Primary;
    }
    return "gray";
  };
  const gameId = uuidv4(); // Generate a 128-bit UUID string
  return (
    <View style={styles.navBar}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() =>
          navigation.replace("HomeScreen", {
            preferredBoardSize: preferredBoardSize,
            user: user,
          })
        }
      >
        <Icon name="home" size={28} color={getColor("HomeScreen")} />
        <Text
          style={[styles.navText, { color: getColor("HomeScreen") }]}
        ></Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() =>
          navigation.replace("SelectPlayScreen", {
            preferredBoardSize: preferredBoardSize,
            user: user,
          })
        }
      >
        <Icon
          name="play-arrow"
          size={28}
          color={getColor("SelectPlayScreen")}
        />
        <Text
          style={[styles.navText, { color: getColor("SelectPlayScreen") }]}
        ></Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() =>
          navigation.replace("HistoryScreen", {
            preferredBoardSize: preferredBoardSize,
            user: user,
          })
        }
      >
        <MaterialCommunityIcons
          name="format-list-bulleted"
          size={28}
          color={getColor("HistoryScreen")}
        />
        <Text
          style={[styles.navText, { color: getColor("HistoryScreen") }]}
        ></Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() =>
          navigation.replace("ProfileScreen", {
            preferredBoardSize: preferredBoardSize,
            user: user,
          })
        }
      >
        <Icon
          name="account-circle"
          size={28}
          color={getColor("ProfileScreen")}
        />
        <Text
          style={[styles.navText, { color: getColor("ProfileScreen") }]}
        ></Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (height, width) => {
  return StyleSheet.create({
    navBar: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "space-around",
      height: height * 0.09,
      backgroundColor: "transparent",
      paddingTop: 10,
      borderTopWidth: 0,
      zIndex: 1000, // Ensure the navbar is on top
    },
    navItem: {
      flex: 1,
      alignItems: "center",
    },
    navText: {
      fontSize: 12,
      color: "gray",
    },
  });
};

export default BottomNavBar;
