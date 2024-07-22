import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import LottieView from "lottie-react-native";
import COLORS from "../data/color";

const LoadingScreen = () => {
  const quotes = [
    "I don’t really care. I’ll just cruise through, like, you know what I mean? – Lil Yachty",
    "I never ever thought I would go into a grocery store and buy a loaf of bread, and a gallon of milk, and sit on a regular toilet seat. – Kanye West",
    "I’m like a vessel, and God has chosen me to be the voice and the connector. – Kanye West",
    "I feel like I’m too busy writing history to read it. – Kanye West",
    "I’m not afraid to die on a treadmill. I will not be outworked, period. – Will Smith",
    "Sorry losers and haters, but my I.Q. is one of the highest—and you all know it! – Donald Trump",
    "Why can’t we just go back to playing Pokemon Go? – Joe Biden",
    "My haters are my motivators. – Donald Trump",
    "Believe in something larger than yourself. – Joe Biden",
    "To be blunt, people would vote for me. They just would. Why? Maybe because I’m so good looking. – Donald Trump",
    "No matter what happens in life, be good to people. Being good to people is a wonderful legacy to leave behind. – Taylor Swift",
    "I’m like a rapper... but I’m not a rapper. – Lil Yachty",
    "I love you like Kanye loves Kanye. – Kanye West",
    "I’m sorry, the old Taylor can’t come to the phone right now. Why? Oh, 'cause she’s dead! – Taylor Swift",
    "Sometimes it’s the journey that teaches you a lot about your destination. – Drake",
    "Life is what you make it. – Taylor Swift",
    "You may have to fight a battle more than once to win it. – Margaret Thatcher",
    "The only limit to our realization of tomorrow is our doubts of today. – Franklin D. Roosevelt",
    "You must expect great things of yourself before you can do them. – Michael Jordan",
    "I’m not afraid to die on a treadmill. I will not be outworked, period. – Will Smith",
    "The best revenge is massive success. – Frank Sinatra",
    "Don’t let the noise of others’ opinions drown out your own inner voice. – Steve Jobs",
    "Sometimes you will never know the value of a moment, until it becomes a memory. – Dr. Seuss",
  ];
  const [quote, setQuote] = useState("");

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[randomIndex]);
  }, []);
  return (
    <View style={styles.container}>
      <LottieView
        source={require("../assets/loading.json")} // Replace with your Lottie animation file path
        autoPlay
        loop
        style={styles.lottie}
      />
      <View style={styles.quoteContainer}>
        <Text style={styles.quote}>{quote}</Text>
      </View>
      {/* <Text style={styles.loadingText}>Loading...</Text> */}
    </View>
  );
};

const styles = StyleSheet.create({
  quoteContainer: {
    marginTop: -100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.Secondary,
    padding: 20,
  },
  quote: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
    fontStyle: "italic",
  },
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
