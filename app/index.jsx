import React, { useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { View, Text } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { Colors } from "../constants/Colors";

function Index() {
  const { currentUser, loading, authInitialized, isAdmin } = useAuth();
  const router = useRouter();
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (authInitialized && !loading && !redirectedRef.current) {
      redirectedRef.current = true;

      const redirect = () => {
        if (currentUser) {
          if (isAdmin) {
            router.replace("/(admin)");
          } else {
            router.replace("/(tabs)");
          }
        } else {
          router.replace("/(auth)/login");
        }
      };

      const timeoutId = setTimeout(redirect, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [authInitialized, loading, currentUser, isAdmin, router]);

  if (!authInitialized || loading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner text="Loading app..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Redirecting...</Text>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  text: {
    fontSize: 16,
    color: Colors.gray600,
  },
};

export default Index;
