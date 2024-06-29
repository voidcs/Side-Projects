import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Icon } from "react-native-elements";
import { useRoute } from "@react-navigation/native";

const BottomNavBar = ({ navigation, preferredBoardSize }) => {
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
          navigation.navigate("HomeScreen", {
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
        onPress={() => navigation.navigate("HomeScreen")}
      >
        <Icon name="home" size={28} color={getColor("ProfileScreen")} />
        <Text style={[styles.navText, { color: getColor("ProfileScreen") }]}>
          Home
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("HomeScreen")}
      >
        <Icon name="home" size={28} color={getColor("ProfileScreen")} />
        <Text style={[styles.navText, { color: getColor("ProfileScreen") }]}>
          Home
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    height: 80,
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

export default BottomNavBar;
