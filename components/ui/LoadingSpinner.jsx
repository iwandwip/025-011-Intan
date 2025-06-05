import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { Colors } from "../../constants/Colors";

const LoadingSpinner = ({
  size = "large",
  color = Colors.primary,
  text = "Loading...",
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  text: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.gray600,
    textAlign: "center",
  },
});

export default LoadingSpinner;
