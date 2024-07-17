import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import LottieView from "lottie-react-native";
import COLORS from "../data/color";

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <LottieView
        source={require("../assets/loading.json")} // Replace with your Lottie animation file path
        autoPlay
        loop
        style={styles.lottie}
      />
      {/* <Text style={styles.loadingText}>Loading...</Text> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.Secondary,
  },
  lottie: {
    width: 500,
    height: 500,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    fontFamily: "SF-Pro",
    color: COLORS.Primary,
  },
});

export default LoadingScreen;
