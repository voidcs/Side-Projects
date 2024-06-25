import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Icon } from "react-native-elements";

const BottomNavBar = ({ navigation }) => {
  return (
    <View style={styles.navBar}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("HomeScreen")}
      >
        <Icon name="home" size={28} color="gray" />
        <Text style={styles.navText}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("HomeScreen")}
      >
        <Icon name="message" size={28} color="gray" />
        <Text style={styles.navText}>Messages</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("HomeScreen")}
      >
        <Icon name="search" size={28} color="gray" />
        <Text style={styles.navText}>Search</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("HomeScreen")}
      >
        <Icon name="person" size={28} color="gray" />
        <Text style={styles.navText}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    height: 60,
    backgroundColor: "#ffffff",
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
