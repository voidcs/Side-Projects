import React from "react";
import { View, Text, StyleSheet } from "react-native";
import BottomNavBar from "../components/BottomNavBar";
import COLORS from "../data/color";

function PlayScreen({ navigation, route }) {
  const { preferredBoardSize, user } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.testText}>test play screen</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.Secondary,
  },
  testText: {
    fontSize: 24,
    color: COLORS.Primary,
  },
  navContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default PlayScreen;
