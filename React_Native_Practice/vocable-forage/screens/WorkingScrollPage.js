import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  Dimensions,
} from "react-native";

const { height, width } = Dimensions.get("window");

const data = Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`);

const renderItem = ({ item }) => (
  <View style={styles.item}>
    <Text style={styles.itemText}>{item}</Text>
  </View>
);

const HomeScreen = () => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.horizontalScrollContainer}>
        <FlatList
          horizontal={true}
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.horizontalContent}
          showsHorizontalScrollIndicator={false}
        />
      </View>
      <View style={styles.textContainer}>
        {data.map((item, index) => (
          <Text key={index} style={styles.text}>
            {item} - Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Nullam scelerisque.
          </Text>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  horizontalScrollContainer: {
    width: "100%",
    height: 50,
    backgroundColor: "#ddd",
    marginVertical: 10,
  },
  horizontalContent: {
    alignItems: "center",
  },
  item: {
    width: 100,
    height: 50,
    backgroundColor: "#fff",
    marginHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  itemText: {
    fontSize: 16,
    color: "#333",
  },
  textContainer: {
    width: "90%",
  },
  text: {
    fontSize: 16,
    marginVertical: 10,
    color: "#333",
  },
});

export default HomeScreen;
