import { Platform, StyleSheet, Text, View } from "react-native";
import { useContext } from "react";
import { AuthContext } from "../store/authContext";

function WelcomeScreen() {
  const authCtx = useContext(AuthContext);

  return (
    <View style={styles.rootContainer}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Welcome!</Text>
        <Text>You authenticated successfully!</Text>
        <Text>Your token:</Text>
        <Text style={styles.tokenText}>{authCtx.token}</Text>
      </View>
    </View>
  );
}

export default WelcomeScreen;

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  contentContainer: {
    alignItems: "center",
    maxWidth: 500,
  },
  tokenText: {
    ...Platform.select({
      web: {
        wordBreak: "break-all",
      },
      default: {},
    }),
  },
});
