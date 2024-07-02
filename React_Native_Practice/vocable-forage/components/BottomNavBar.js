import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Icon } from "react-native-elements";
import { useRoute } from "@react-navigation/native";

const BottomNavBar = ({ navigation, preferredBoardSize }) => {
  const { height, width } = Dimensions.get("window");
  const styles = createStyles(height, width);
  const route = useRoute();
  const getColor = (screenName) => {
    if (route.name === screenName) {
      return "#a02f58";
    }
    if (screenName === "PlayScreen" && route.name === "EndGameScreen") {
      return "#a02f58";
    }
    return "gray";
  };

  return (
    <View style={styles.navBar}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() =>
          navigation.replace("HomeScreen", {
            preferredBoardSize: preferredBoardSize,
          })
        }
      >
        <Icon name="home" size={28} color={getColor("HomeScreen")} />
        <Text style={[styles.navText, { color: getColor("HomeScreen") }]}>
          Home
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => {
          navigation.reset({
            index: 0,
            routes: [
              {
                name: "PlayScreen",
                params: {
                  boardLength: preferredBoardSize,
                  preferredBoardSize: preferredBoardSize,
                },
              },
            ],
          });
        }}
      >
        <Icon name="play-arrow" size={28} color={getColor("PlayScreen")} />
        <Text style={[styles.navText, { color: getColor("PlayScreen") }]}>
          Play
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        // onPress={() => navigation.replace("HomeScreen")}
      >
        <Icon name="home" size={28} color={getColor("StatsScreen")} />
        <Text style={[styles.navText, { color: getColor("StatsScreen") }]}>
          Home
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() =>
          navigation.replace("ProfileScreen", {
            preferredBoardSize: preferredBoardSize,
          })
        }
      >
        <Icon
          name="account-circle"
          size={28}
          color={getColor("ProfileScreen")}
        />
        <Text style={[styles.navText, { color: getColor("ProfileScreen") }]}>
          Profile
        </Text>
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
      height: height * 0.1,

      backgroundColor: "#FBF4F6",
      paddingTop: 10,
      borderTopWidth: 0,
      elevation: 0,
      shadowOpacity: 0,
    },
    navItem: {
      alignItems: "center",
    },
    navText: {
      fontSize: 12,
      color: "gray",
    },
  });
};

export default BottomNavBar;
