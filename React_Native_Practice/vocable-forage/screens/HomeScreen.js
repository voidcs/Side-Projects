import React, { useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Button from "../components/Button";
import BottomNavBar from "../components/BottomNavBar";
import LoadingScreen from "../screens/LoadingScreen";
import COLORS from "../data/color";

function HomeScreen({ navigation, route }) {
  const { preferredBoardSize, user } = route.params;
  const { height, width } = Dimensions.get("window");
  console.log("in home: ", height, width);
  const styles = createStyles(height, width);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>This is my laptop version</Text>
      <View style={styles.buttonContainer}>
        <Button
          title={"2x2"}
          navigation={navigation}
          preferredBoardSize={2}
          user={user}
          height={height}
          width={width}
        />
        <Button
          title={"4x4"}
          navigation={navigation}
          preferredBoardSize={4}
          user={user}
          height={height}
          width={width}
        />
        <Button
          title={"5x5"}
          navigation={navigation}
          preferredBoardSize={5}
          user={user}
          height={height}
          width={width}
        />
        <Button title={"Stats"} height={height} width={width} />
      </View>
      <View style={styles.navContainer}>
        <BottomNavBar
          navigation={navigation}
          preferredBoardSize={preferredBoardSize}
          user={user}
        />
      </View>
    </View>
  );
}

export default HomeScreen;

const createStyles = (height, width) => {
  return StyleSheet.create({
    background: {
      flex: 1,
      resizeMode: "cover",
    },
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
      backgroundColor: COLORS.Secondary,
    },
    buttonContainer: {
      height: height * 0.45,
      width: "80%",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "#e0e0e0",
      backgroundColor: "#f9f9f9",
      borderRadius: 10,
      elevation: 3,
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      padding: 10,
    },
    title: {
      paddingBottom: 150,
    },
  });
};
