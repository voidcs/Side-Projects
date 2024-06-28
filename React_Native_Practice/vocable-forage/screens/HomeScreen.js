import { View, Text, StyleSheet, ImageBackground } from "react-native";
import Button from "../components/Button";
import BottomNavBar from "../components/BottomNavBar";
function HomeScreen({ navigation }) {
  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>Hello Borpa The Home Screen Lol</Text>
        <View style={styles.buttonContainer}>
          <Button title={"4x4"} navigation={navigation} />
          <Button title={"5x5"} navigation={navigation} />
          <Button title={"History"} />
          <Button title={"Stats"} />
        </View>
        <View style={styles.navContainer}>
          <BottomNavBar navigation={navigation} />
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
