import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Dimensions,
  FlatList,
  TouchableOpacity,
} from "react-native";
import Svg, { Line } from "react-native-svg";
import BottomNavBar from "../components/BottomNavBar";
import POINTS from "../data/point-distribution";

function EndGameScreen({ navigation, route }) {
  // if user is null, then we just use this old code
  // otherwise, we should print all players who played this board
  const {
    allWords,
    foundWords,
    words,
    score,
    preferredBoardSize,
    board,
    boardLength,
    wordsPerCell,
    user,
  } = route.params;
  const { height, width } = Dimensions.get("window");

  const styles = createStyles(boardLength, height);
  const [activeTab, setActiveTab] = useState("Found");
  const [currentPage, setCurrentPage] = useState("Results");
  const [pointSum, setPointSum] = useState(0);
  useEffect(() => {
    let totalPoints = 0;

    allWords.forEach((word) => {
      const points = POINTS[word.length] || 0;
      totalPoints += points;
    });

    setPointSum(totalPoints);
  }, [allWords]);

  const sortWords = (words) => {
    return words.sort((a, b) => {
      if (b.length === a.length) {
        return a.localeCompare(b);
      }
      return b.length - a.length;
    });
  };
  for (let i = 0; i < boardLength; i++) {
    for (let j = 0; j < boardLength; j++) {
      wordsPerCell[i][j] = sortWords(wordsPerCell[i][j]);
    }
  }
  const sortedAllWords = sortWords(allWords);
  const sortedFoundWords = sortWords(foundWords);

  const wordsToDisplay =
    activeTab === "Found" ? sortedFoundWords : sortedAllWords;

  const renderItem = ({ item }) => {
    const points = POINTS[item.length] || 0;
    return (
      <View style={styles.wordContainer}>
        <Text style={styles.wordText}>{item}</Text>
        <Text style={styles.pointText}>{points}</Text>
      </View>
    );
  };

  const [activeCell, setActiveCell] = useState({ row: null, col: null });
  const boardLayoutRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const cellLayoutsRef = useRef({});

  const onLayoutCell = (event, rowIndex, cellIndex) => {
    const key = `${rowIndex}-${cellIndex}`;
    const cell = event.target;

    cell.measure((x, y, width, height, pageX, pageY) => {
      const boardX = boardLayoutRef.current.x;
      const boardY = boardLayoutRef.current.y;
      cellLayoutsRef.current[key] = {
        x: pageX,
        y: pageY,
        width,
        height,
      };
    });
  };

  const onLayoutBoard = (event) => {
    const board = event.target;
    requestAnimationFrame(() => {
      setTimeout(() => {
        board.measure((x, y, width, height, pageX, pageY) => {
          boardLayoutRef.current = { x: pageX, y: pageY, width, height };
        });
      }, 0);
    });
  };

  const activeTilesRef = useRef([]);
  const [activeTiles, setActiveTiles] = useState([]);

  useEffect(() => {
    activeTilesRef.current = activeTiles;
  }, [activeTiles]);

  const activeTilesLocRef = useRef([]);
  const [activeTilesLoc, setActiveTilesLoc] = useState([]);

  useEffect(() => {
    activeTilesLocRef.current = activeTilesLoc;
  }, [activeTilesLoc]);

  const handleCellPress = (row, col) => {
    if (activeCell.row === row && activeCell.col === col) {
      setActiveCell({ row: null, col: null });
    } else {
      setActiveCell({ row, col });
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.pageContainer}>
        <TouchableOpacity
          style={[
            styles.pageTab,
            currentPage === "Results" && styles.pageActiveTab,
          ]}
          onPress={() => setCurrentPage("Results")}
        >
          <Text
            style={[
              styles.pageTabText,
              currentPage === "Results" && styles.pageActiveTabText,
            ]}
          >
            Results
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.pageTab,
            currentPage === "Review" && styles.pageActiveTab,
          ]}
          onPress={() => setCurrentPage("Review")}
        >
          <Text
            style={[
              styles.pageTabText,
              currentPage === "Review" && styles.pageActiveTabText,
            ]}
          >
            Review
          </Text>
        </TouchableOpacity>
      </View>
      {currentPage === "Results" && (
        <>
          <View style={styles.scoreContainer}>
            <Text style={styles.title}>
              Score: {activeTab === "Found" ? score : pointSum}
            </Text>
            <Text style={styles.title}>
              Words: {activeTab === "Found" ? words : allWords.length}
            </Text>
          </View>
          <View style={styles.scrollContainer}>
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === "Found" && styles.activeTab]}
                onPress={() => setActiveTab("Found")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "Found" && styles.activeTabText,
                  ]}
                >
                  Found
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === "All" && styles.activeTab]}
                onPress={() => setActiveTab("All")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "All" && styles.activeTabText,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={wordsToDisplay}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </>
      )}
      {currentPage === "Review" && (
        <>
          <View style={styles.reviewScrollContainer}>
            {activeCell.row === null && activeCell.col === null ? (
              <Text style={styles.noWordsFound}>Click a cell for words</Text>
            ) : Array.from(wordsPerCell[activeCell.row][activeCell.col])
                .length === 0 ? (
              <Text style={styles.noWordsFound}>No words found</Text>
            ) : (
              <FlatList
                data={Array.from(wordsPerCell[activeCell.row][activeCell.col])}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                style={styles.wordsList}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
          <View style={styles.background}>
            <Svg
              style={styles.svgOverlay}
              height={height}
              width={width}
              viewBox={`0 0 ${width} ${height}`}
            >
              {activeTilesLocRef.current.map((point, index) => {
                if (index < activeTilesLocRef.current.length - 1) {
                  const nextPoint = activeTilesLocRef.current[index + 1];
                  return (
                    <Line
                      key={index}
                      x1={point.x}
                      y1={point.y}
                      x2={nextPoint.x}
                      y2={nextPoint.y}
                      stroke="red"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeOpacity="0.5"
                    />
                  );
                }
                return null;
              })}
            </Svg>

            <View style={styles.board} onLayout={onLayoutBoard}>
              {board.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.row}>
                  {row.map((cell, cellIndex) => {
                    const isActive = activeTiles.some(
                      (tile) => tile.x === rowIndex && tile.y === cellIndex
                    );
                    return (
                      <Pressable
                        key={`${rowIndex}-${cellIndex}`}
                        style={styles.touchable}
                        onPress={() => handleCellPress(rowIndex, cellIndex)}
                      >
                        <View
                          key={cellIndex}
                          style={[
                            styles.cell,
                            isActive && styles.validCell,
                            activeCell.row === rowIndex &&
                              activeCell.col === cellIndex &&
                              styles.clickedCell,
                          ]}
                          onLayout={(event) =>
                            onLayoutCell(event, rowIndex, cellIndex)
                          }
                        >
                          <Text style={styles.cellText}>{cell}</Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
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
      )}
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

export default EndGameScreen;

const createStyles = (boardLength, height) => {
  const cellSize = (height * 0.4) / boardLength;
  return StyleSheet.create({
    scoreContainer: {
      marginVertical: height * 0.02,
      height: 50,
      width: "80%",
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
    },
    pageActiveTabText: {
      color: "#a02f58",
      fontWeight: "bold",
    },
    pageTabText: {
      fontSize: 18,
      color: "gray",
    },
    pageTab: {
      flex: 1,
      paddingVertical: 10,
      borderBottomWidth: 2,
      borderBottomColor: "transparent",
      alignItems: "center",
    },
    pageActiveTab: {
      borderBottomColor: "#a02f58",
    },
    pageContainer: {
      flexDirection: "row",
      marginBottom: 10,
    },
    container: {
      flex: 1,
      alignItems: "center",
      backgroundColor: "#FBF4F6",
      paddingTop: 40,
      marginTop: height * 0.03,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: "#a02f58",
    },
    tabContainer: {
      flexDirection: "row",
      position: "absolute",
      top: -30, // Adjust this value to position the tabs above the words container
      left: 10, // Adjust this value to position the tabs on the top left of the words container
      zIndex: 1, // Ensure tabs are above other elements
    },
    tab: {
      paddingVertical: 5,
      flex: 1,
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#a02f58",
      backgroundColor: "#FBF4F6",
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      marginRight: 5,
    },
    activeTab: {
      backgroundColor: "#a02f58",
    },
    tabText: {
      fontSize: 14,
      color: "gray",
    },
    activeTabText: {
      color: "#FBF4F6",
      fontWeight: "bold",
    },
    scrollContainer: {
      width: "60%",
      height: "50%",
      backgroundColor: "#ffffff",
      marginTop: height * 0.05,
      borderRadius: 10,
      padding: 10,
      borderWidth: 1,
      borderColor: "#a02f58",
      position: "relative",
    },
    reviewScrollContainer: {
      width: "60%",
      height: "30%",
      backgroundColor: "#ffffff",
      marginTop: height * 0.01,
      borderRadius: 10,
      padding: 10,
      borderWidth: 1,
      borderColor: "#a02f58",
      position: "relative",
    },
    scrollContent: {
      flexGrow: 1,
    },
    wordContainer: {
      flexDirection: "row",
      justifyContent: "space-between", // Ensure words are left aligned and points are right aligned
      paddingVertical: 2,
    },
    wordText: {
      fontSize: 18,
      textAlign: "left",
      fontFamily: Platform.OS === "ios" ? "RobotoMono-Regular" : "monospace", // SF Mono or Menlo?
      flex: 1,
    },
    noWordsFound: {
      fontSize: 18,
      textAlign: "center",
      fontFamily: Platform.OS === "ios" ? "RobotoMono-Regular" : "monospace", // SF Mono or Menlo?
      flex: 1,
    },
    pointText: {
      fontSize: 18,
      textAlign: "right",
      fontFamily: Platform.OS === "ios" ? "RobotoMono-Regular" : "monospace", // Sf Mono or Menlo
    },
    summaryContainer: {
      marginTop: 10,
      alignItems: "center",
    },
    summaryText: {
      fontSize: 18,
      color: "#a02f58",
      fontWeight: "bold",
    },
    navContainer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
    },
    // Everything after this is the board styling
    background: {
      flex: 1,
      resizeMode: "cover",
      backgroundColor: "#FBF4F6",
      position: "relative",
      justifyContent: "flex-end",
    },
    svgOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1,
      pointerEvents: "none",
    },
    board: {
      position: "absolute",
      bottom: 100, // navBar height is 80 btw
      padding: 5,
      backgroundColor: "#a02f58",
      justifyContent: "center",
      alignItems: "center",
      alignSelf: "center",
      borderRadius: 8,
    },
    row: {
      flexDirection: "row",
    },
    cell: {
      margin: 1.5,
      width: cellSize,
      height: cellSize,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#000",
      backgroundColor: "#ffffff",
      borderRadius: 8,
    },
    validCell: {
      backgroundColor: "#82267E", // Green background for valid words
    },
    cellText: {
      // 0.65
      fontSize: cellSize * 0.6,
      color: "#000",
      fontWeight: "800",
    },
    clickedCell: {
      backgroundColor: "yellow",
    },
  });
};
