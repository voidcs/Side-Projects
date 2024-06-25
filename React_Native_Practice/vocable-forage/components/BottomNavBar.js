import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Icon } from "react-native-elements";
import { useRoute } from "@react-navigation/native";

const BottomNavBar = ({ navigation }) => {
  const route = useRoute();

  const getColor = (screenName) => {
    return route.name === screenName ? "#a02f58" : "gray";
  };

  return (
    <View style={styles.navBar}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("HomeScreen")}
      >
        <Icon name="home" size={28} color={getColor("HomeScreen")} />
        <Text style={[styles.navText, { color: getColor("HomeScreen") }]}>
          Home
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("MessageScreen")}
      >
        <Icon name="message" size={28} color={getColor("MessageScreen")} />
        <Text style={[styles.navText, { color: getColor("MessageScreen") }]}>
          Messages
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("SearchScreen")}
      >
        <Icon name="search" size={28} color={getColor("SearchScreen")} />
        <Text style={[styles.navText, { color: getColor("SearchScreen") }]}>
          Search
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("ProfileScreen")}
      >
        <Icon name="person" size={28} color={getColor("ProfileScreen")} />
        <Text style={[styles.navText, { color: getColor("ProfileScreen") }]}>
          Profile
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
    backgroundColor: "#ffffff",
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
