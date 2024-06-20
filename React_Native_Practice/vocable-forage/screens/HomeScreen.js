import { View, Text, StyleSheet, ImageBackground } from "react-native";
import Button from "../components/Button";

function HomeScreen({ navigation }) {
  // function renderCategoryItem(itemData) {
  //   function pressHandler() {
  //     navigation.navigate("MealsOverview", {
  //       categoryId: itemData.item.id,
  //     });
  //   }
  //   return (
  //     <CategoryGridTile
  //       title={itemData.item.title}
  //       color={itemData.item.color}
  //       onPress={pressHandler}
  //     />
  //   );
  // }
  return (
    <>
      <ImageBackground
        source={require("../assets/morocco-blue.png")}
        style={styles.background}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Hello Borpa The Title Screen</Text>
          <View style={styles.buttonContainer}>
            <Button title={"4x4"} navigation={navigation} />
            <Button title={"5x5"} navigation={navigation} />
            <Button title={"History"} />
            <Button title={"Stats"} />
          </View>
        </View>
      </ImageBackground>
    </>
  );
}
export default HomeScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: {
    width: "80%",
  },
  title: {
    paddingBottom: 150,
  },
});
