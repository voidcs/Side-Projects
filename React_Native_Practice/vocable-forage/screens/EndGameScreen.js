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
  Modal,
} from "react-native";
import { useFonts } from "expo-font";
import Svg, { Line } from "react-native-svg";
import BottomNavBar from "../components/BottomNavBar";
import POINTS from "../data/point-distribution";

function EndGameScreen({ navigation, route }) {
  // if user is null, then we just use this old code
  // otherwise, we should print all players who played this board
  const { preferredBoardSize, user, gameId } = route.params;

  const [gameData, setGameData] = useState(null);
  const [otherScores, setOtherScores] = useState([]);
  const [otherScoresNames, setOtherScoresNames] = useState([]);
  const [error, setError] = useState(null);
  const [dbWordsPerCell, setDbWordsPerCell] = useState(null);
  const [myFoundWords, setMyFoundWords] = useState([]);
  const [pointSum, setPointSum] = useState(0);
  const [myPointSum, setMyPointSum] = useState(0);
  const [board, setBoard] = useState([]);
  const [boardLength, setBoardLength] = useState(0);
  const calculatePoints = (words) => {
    let totalPoints = 0;
    words.forEach((word) => {
      const points = POINTS[word.length] || 0;
      totalPoints += points;
    });
    setPointSum(totalPoints);
  };
  const calculateMyPoints = (words) => {
    let totalPoints = 0;
    words.forEach((word) => {
      const points = POINTS[word.length] || 0;
      totalPoints += points;
    });
    setMyPointSum(totalPoints);
  };

  useEffect(() => {
    console.log("in effect hook: ", gameId);
    const getGameData = async () => {
      try {
        const response = await fetch(
          "http://ec2-3-145-75-212.us-east-2.compute.amazonaws.com:3000/getGameById",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ gameId: gameId }),
          }
        );
        if (!response.ok) {
          const message = `The getGameData request failed: ${response.statusText}`;
          throw new Error(message);
        }

        const data = await response.json();
        if (data.success) {
          console.log("Game data fetched successfully");
          setGameData(data.data);
          setOtherScores([
            ...[data.data.allWords],
            ...data.data.players.map((player) => player.wordsFoundForThisPlay),
          ]);
          setOtherScoresNames([
            ...["All Words"],
            ...data.data.players.map((player) => player.username),
          ]);
          // console.log("names: ", [
          //   ...["All Words"],
          //   ...data.data.players.map((player) => player.username),
          // ]);

          const sortWords = (words) => {
            return words.sort((a, b) => {
              if (b.length === a.length) {
                return a.localeCompare(b);
              }
              return b.length - a.length;
            });
          };
          data.data.players.forEach((player, index) => {
            if (player.username === user.username) {
              setMyFoundWords(
                sortWords(data.data.players[index].wordsFoundForThisPlay)
              );
              calculateMyPoints(data.data.players[index].wordsFoundForThisPlay);
            }
          });
          setSelectedWordList(sortWords(data.data.allWords));
          const sortedWordsPerCell = data.data.wordsPerCell.map((row) =>
            row.map((cell) => sortWords(cell.slice()))
          );
          calculatePoints(data.data.allWords);
          setDbWordsPerCell(sortedWordsPerCell);
          setBoard(data.data.board);
          setBoardLength(data.data.board.length);
          // console.log("data: ", sortedWordsPerCell);
          // setOtherScoresNames(...["All Words"], ...);
          // Handle the game data as needed
          // Additional handling of the fetched data
        } else {
          console.error("Game data not found or another error occurred");
          // Handle the case where game data is not found or success is false
        }
      } catch (error) {
        console.error("Error fetching game data:", error);
        // Handle the error appropriately in your application
      }
    };
    getGameData();
  }, []);
  // console.log("gameData: ", gameData);
  const { height, width } = Dimensions.get("window");
  useFonts({
    "RobotoMono-Regular": require("../assets/fonts/RobotoMono-Regular.ttf"),
    "RobotoMono-Medium": require("../assets/fonts/RobotoMono-Medium.ttf"),
  });
  const styles = createStyles(boardLength, height, width);
  const [activeTab, setActiveTab] = useState("Found");
  const [currentPage, setCurrentPage] = useState("Results");

  const sortWords = (words) => {
    return words.sort((a, b) => {
      if (b.length === a.length) {
        return a.localeCompare(b);
      }
      return b.length - a.length;
    });
  };

  const renderItem = ({ item }) => {
    const points = POINTS[item.length] || 0;
    return (
      <View style={styles.wordContainer}>
        <Text style={styles.wordText}>{item}</Text>
        <Text style={styles.pointText}>{points}</Text>
      </View>
    );
  };

  const renderReviewItem = ({ item }) => {
    const points = POINTS[item.length] || 0;
    return (
      <View style={styles.reviewWordContainer}>
        <Text style={styles.reviewWordText}>{item}</Text>
        <Text style={styles.reviewPointText}>{points}</Text>
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
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedValue, setSelectedValue] = useState("All Words");
  const [selectedWordList, setSelectedWordList] = useState([]);
  const renderModalItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.dropdownRow}
      onPress={() => {
        setSelectedValue(item);
        setModalVisible(false);
        setSelectedWordList(otherScores[index]);
        console.log("other: ", otherScores[index]);
        calculatePoints(otherScores[index]);
        // setSelectedScore(otherScores[index]); // Set the useState variable to the ith element in otherScores
      }}
    >
      <Text style={styles.dropdownRowText}>{item}</Text>
    </TouchableOpacity>
  );

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
        <View style={styles.scoringContainer}>
          <View style={[styles.column, { width: width * 0.5 }]}>
            <View style={styles.scoreContainer}>
              <Text style={styles.title}>Score: {myPointSum}</Text>
              <Text style={styles.title}>Words: {myFoundWords.length}</Text>
            </View>
            <View style={styles.scrollContainer}>
              <View style={[styles.tabContainer, { width: width * 0.4 }]}>
                <View style={[styles.tab, styles.activeTab]}>
                  <Text style={[styles.tabText, styles.activeTabText]}>
                    {user.username}
                  </Text>
                </View>
              </View>
              <FlatList
                data={myFoundWords}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </View>
          <View style={[styles.column, { width: width * 0.5 }]}>
            <View style={styles.scoreContainer}>
              <Text style={styles.title}>Score: {pointSum}</Text>
              <Text style={styles.title}>Words: {selectedWordList.length}</Text>
            </View>
            <View style={styles.scrollContainer}>
              <View style={[styles.tabContainer]}>
                <View style={{ width: "100%" }}>
                  <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    style={[styles.tab, styles.activeTab]}
                  >
                    <Text style={[styles.tabText, styles.activeTabText]}>
                      {"▼  " + selectedValue + "  ▼"}
                    </Text>
                  </TouchableOpacity>

                  <Modal
                    transparent={true}
                    animationType="slide"
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                  >
                    <View style={styles.modalContainer}>
                      <View
                        style={[styles.modalContent, { width: width * 0.6 }]}
                      >
                        <FlatList
                          data={otherScoresNames}
                          renderItem={renderModalItem}
                          keyExtractor={(item, index) => index.toString()}
                        />
                        <TouchableOpacity
                          onPress={() => setModalVisible(false)}
                          style={styles.closeButton}
                        >
                          <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Modal>
                </View>
              </View>
              <FlatList
                data={selectedWordList}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                showsVerticalScrollIndicator={false}
                initialScrollIndex={0} // Ensure this index is valid
              />
            </View>
          </View>
        </View>
      )}
      {currentPage === "Review" && (
        <>
          <View style={styles.reviewScrollContainer}>
            {activeCell.row === null && activeCell.col === null ? (
              <Text style={styles.noWordsFound}>Click a cell for words</Text>
            ) : Array.from(dbWordsPerCell[activeCell.row][activeCell.col])
                .length === 0 ? (
              <Text style={styles.noWordsFound}>No words found</Text>
            ) : (
              <FlatList
                data={Array.from(
                  dbWordsPerCell[activeCell.row][activeCell.col]
                )}
                renderItem={renderReviewItem}
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

const createStyles = (boardLength, height, width) => {
  const cellSize = (height * 0.4) / boardLength;
  return StyleSheet.create({
    scoreContainer: {
      height: 30,
      width: "90%",
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
      fontSize: 18,
      fontWeight: "bold",
      color: "#a02f58",
    },
    tabContainer: {
      flexDirection: "row",
      alignSelf: "center",
      position: "absolute",
      top: -30, // Adjust this value to position the tabs above the words container
      zIndex: 1, // Ensure tabs are above other elements
    },
    tab: {
      paddingVertical: 5,
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
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
      width: "90%",
      height: "60%",
      backgroundColor: "#ffffff",
      marginTop: height * 0.05,
      borderRadius: 10,
      padding: 7,
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
      fontSize: 16,
      textAlign: "left",
      fontFamily: Platform.OS === "ios" ? "RobotoMono-Regular" : "monospace", // SF Mono or Menlo?
      flex: 1,
    },
    noWordsFound: {
      fontSize: 16,
      textAlign: "center",
      fontFamily: Platform.OS === "ios" ? "RobotoMono-Regular" : "monospace", // SF Mono or Menlo?
      flex: 1,
    },
    pointText: {
      fontSize: 16,
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
    scoringContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    column: {
      margin: 2,
      justifyContent: "center",
      alignItems: "center",
      // borderColor: "black",
    },
    reviewWordContainer: {
      flexDirection: "row",
      justifyContent: "space-between", // Ensure words are left aligned and points are right aligned
      paddingVertical: 2,
    },
    reviewWordText: {
      fontSize: 18,
      textAlign: "left",
      fontFamily: Platform.OS === "ios" ? "RobotoMono-Regular" : "monospace", // SF Mono or Menlo?
      flex: 1,
    },
    reviewPointText: {
      fontSize: 18,
      textAlign: "right",
      fontFamily: Platform.OS === "ios" ? "RobotoMono-Regular" : "monospace", // Sf Mono or Menlo
    },
    modalBox: {
      width: "100%",
      // borderWidth: 5,
    },
    dropdownRow: {
      width: "100%",
      paddingVertical: 10,
      paddingHorizontal: 20,
      marginVertical: 5,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#a02f58", // Match the background color
      borderRadius: 10,
    },
    dropdownRowText: {
      fontSize: 20,
      textAlign: "center",
      color: "#FBF4F6", // Match the text color
    },
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
      backgroundColor: "white",
      borderRadius: 10,
      padding: 20,
      width: "100%",
    },
    closeButton: {
      marginTop: 20,
      padding: 10,
      backgroundColor: "#ccc",
      borderRadius: 5,
      alignItems: "center",
    },
    closeButtonText: {
      color: "#000",
    },
  });
};
