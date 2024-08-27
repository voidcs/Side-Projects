import React from "react";
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";
import Constants from "expo-constants";
import COLORS from "../data/color";

const { width } = Dimensions.get("window");
const statusBarHeight = Constants.statusBarHeight;

const Header = () => {
  return (
    <View style={[styles.headerContainer, { paddingTop: statusBarHeight }]}>
      <View style={styles.flexContainer}>
        <View style={styles.placeholder} />
        <View style={styles.centerContainer}>
          <Text style={styles.headerText}>Profile</Text>
        </View>
        <Image
          source={require("../assets/defaultProfile.png")}
          style={styles.profileImage}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.Neutral,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    width: width,
    zIndex: 1000,
  },
  flexContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  placeholder: {
    width: 40, // Same width as the profile image to keep alignment
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});

export default Header;
