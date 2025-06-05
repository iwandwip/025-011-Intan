import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "./ui/LoadingSpinner";
import { Colors } from "../constants/Colors";

const AuthGuard = ({ children, requireAuth = false }) => {
  const { currentUser, loading, authInitialized } = useAuth();

  if (!authInitialized || loading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner text="Loading..." />
      </View>
    );
  }

  if (requireAuth && !currentUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          Access denied. Please login to continue.
        </Text>
      </View>
    );
  }

  if (!requireAuth && currentUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>You are already logged in.</Text>
      </View>
    );
  }

  return children;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  message: {
    fontSize: 16,
    color: Colors.gray600,
    textAlign: "center",
    paddingHorizontal: 24,
  },
});

export default AuthGuard;
