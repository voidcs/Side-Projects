import React, { useEffect } from "react";
import { View, Text, StyleSheet, Dimensions, FlatList } from "react-native";
import Button from "../components/Button";
import BottomNavBar from "../components/BottomNavBar";
import { LinearGradient } from "expo-linear-gradient";
import COLORS from "../data/color";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from "react-native-reanimated";

const SelectPlayScreen = ({ navigation, route }) => {
  const { preferredBoardSize, user } = route.params;
  const { height, width } = Dimensions.get("window");

  const buttonsBoxTranslateY = useSharedValue(height); // Start from off-screen at the bottom

  // Animated style for buttonsBox
  const buttonsBoxStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: buttonsBoxTranslateY.value }],
    };
  });

  // Trigger the buttonsBox animation on mount
  useEffect(() => {
    buttonsBoxTranslateY.value = withDelay(0, withTiming(0, { duration: 500 })); // Animate upwards
  }, [buttonsBoxTranslateY]);

  const createAnimatedStyle = (initialOffset, delay) => {
    const translateX = useSharedValue(initialOffset); // Start from the specified offset

    // Animated style for buttons
    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ translateX: translateX.value }],
      };
    });

    // Trigger the button animation on mount with a delay
    useEffect(() => {
      translateX.value = withDelay(delay, withTiming(0, { duration: 500 })); // Delay before animating to the intended position
    }, [translateX]);

    return animatedStyle;
  };

  const styles = createStyles(height, width);

  const data = [
    { id: "1", text: "Game 1" },
    { id: "2", text: "Game 2" },
    { id: "3", text: "Game 3" },
    { id: "4", text: "Game 4" },
    { id: "5", text: "Game 5" },
    { id: "6", text: "Game 6" },
    { id: "7", text: "Game 7" },
    { id: "8", text: "Game 8" },
    { id: "9", text: "Game 9" },
    { id: "10", text: "Game 10" },
  ];

  const renderItem = ({ item, index }) => (
    <View
      style={[
        styles.item,
        index === 0 ? { marginLeft: (width - width * 0.7) / 2 } : {},
        index === data.length - 1
          ? { marginRight: (width - width * 0.7) / 2 }
          : {},
      ]}
    >
      <Text style={styles.itemText}>{item.text}</Text>
    </View>
  );

  return (
    <LinearGradient
      colors={[COLORS.Primary, COLORS.Secondary]}
      style={styles.container}
    >
      <View style={styles.flatListContainer}>
        <FlatList
          horizontal={true}
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.contentContainerStyle}
          showsHorizontalScrollIndicator={false}
        />
      </View>
      <Animated.View style={[styles.buttonsBox, buttonsBoxStyle]} />
      <View style={styles.buttonContainer}>
        <Animated.View
          style={[styles.animateBox, createAnimatedStyle(-200, 50)]}
        >
          <Button
            title={"2x2"}
            navigation={navigation}
            preferredBoardSize={2}
            user={user}
            height={height}
            width={width}
          />
        </Animated.View>
        <Animated.View
          style={[styles.animateBox, createAnimatedStyle(-200, 100)]}
        >
          <Button
            title={"4x4"}
            navigation={navigation}
            preferredBoardSize={4}
            user={user}
            height={height}
            width={width}
          />
        </Animated.View>
        <Animated.View
          style={[styles.animateBox, createAnimatedStyle(-200, 150)]}
        >
          <Button
            title={"5x5"}
            navigation={navigation}
            preferredBoardSize={5}
            user={user}
            height={height}
            width={width}
          />
        </Animated.View>
        <Animated.View
          style={[styles.animateBox, createAnimatedStyle(-200, 200)]}
        >
          <Button title={"Stats"} height={height} width={width} />
        </Animated.View>
      </View>
      <View style={styles.navContainer}>
        <BottomNavBar
          navigation={navigation}
          preferredBoardSize={preferredBoardSize}
          user={user}
        />
      </View>
    </LinearGradient>
  );
};

export default SelectPlayScreen;

const createStyles = (height, width) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.Primary,
      alignItems: "center",
      justifyContent: "flex-start",
      paddingTop: height * 0.05,
    },
    flatListContainer: {
      height: height * 0.3,
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    contentContainerStyle: {
      alignItems: "center",
    },
    item: {
      width: width * 0.7,
      height: height * 0.2,
      padding: 20,
      marginHorizontal: width * 0.05,
      backgroundColor: COLORS.Secondary,
      borderRadius: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 3,
      justifyContent: "center",
      alignItems: "center",
    },
    itemText: {
      fontSize: 18,
      color: "black",
    },
    buttonsBox: {
      position: "absolute",
      bottom: 0,
      height: height * 0.64,
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
      borderColor: "#e0e0e0",
      backgroundColor: COLORS.Secondary,
      borderTopLeftRadius: 65,
      borderTopRightRadius: 65,
      elevation: 3,
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      padding: 10,
      marginBottom: height * 0.02,
    },
    buttonContainer: {
      height: height * 0.54,
      marginTop: height * 0.01,
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
      borderColor: "#e0e0e0",
      backgroundColor: "transparent",
    },
    navContainer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
    },
    title: {
      fontSize: 24,
      color: "black",
    },
    animateBox: {
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
    },
  });
};
