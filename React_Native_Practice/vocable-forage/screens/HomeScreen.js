import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Button from "../components/Button";
import BottomNavBar from "../components/BottomNavBar";
import LoadingScreen from "../screens/LoadingScreen";
import COLORS from "../data/color";

function HomeScreen({ navigation, route }) {
  const { preferredBoardSize, user } = route.params;
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadingState = (loading) => {
    setIsLoading(loading);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingScreen />
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>This is my laptop version</Text>
      <View style={styles.buttonContainer}>
        <Button
          title={"2x2"}
          navigation={navigation}
          preferredBoardSize={2}
          user={user}
          setLoading={handleLoadingState}
        />
        <Button
          title={"4x4"}
          navigation={navigation}
          preferredBoardSize={4}
          user={user}
          setLoading={handleLoadingState}
        />
        <Button
          title={"5x5"}
          navigation={navigation}
          preferredBoardSize={5}
          user={user}
          setLoading={handleLoadingState}
        />
        <Button title={"Stats"} setLoading={handleLoadingState} />
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

const styles = StyleSheet.create({
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
    width: "80%",
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    elevation: 3, // This adds shadow on Android, similar to box-shadow
    shadowColor: "#000000", // Shadow color for iOS
    shadowOffset: { width: 0, height: 4 }, // Shadow offset for iOS, similar to the horizontal and vertical offsets in CSS
    shadowOpacity: 0.05, // Opacity of shadow for iOS
    shadowRadius: 8, // Blur radius for iOS
    borderRadius: 10, // Rounded corners
    padding: 10, // Internal spacing
  },
  title: {
    paddingBottom: 150,
  },
});
