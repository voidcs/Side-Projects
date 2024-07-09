import { View, Text, StyleSheet, ImageBackground } from "react-native";
import Button from "../components/Button";
import BottomNavBar from "../components/BottomNavBar";
function HomeScreen({ navigation, route }) {
  const { preferredBoardSize, user } = route.params;
  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>
          The app will crash if you don't sign into an account LOL
        </Text>
        <View style={styles.buttonContainer}>
          <Button
            title={"2x2"}
            navigation={navigation}
            preferredBoardSize={2}
            user={user}
          />
          <Button
            title={"4x4"}
            navigation={navigation}
            preferredBoardSize={4}
            user={user}
          />
          <Button
            title={"5x5"}
            navigation={navigation}
            preferredBoardSize={5}
            user={user}
          />
          <Button title={"Stats"} />
        </View>
        <View style={styles.navContainer}>
          <BottomNavBar
            navigation={navigation}
            preferredBoardSize={preferredBoardSize}
            user={user}
          />
        </View>
      </View>
    </>
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
    backgroundColor: "#FBF4F6",
  },
  buttonContainer: {
    width: "80%",
  },
  title: {
    paddingBottom: 150,
  },
});
