import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  StatusBar,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AuthForm from "../../components/auth/AuthForm";
import IllustrationContainer from "../../components/ui/IllustrationContainer";
import LoginIllustration from "../../components/illustrations/LoginIllustration";
import { signInWithEmail } from "../../services/authService";
import { Colors } from "../../constants/Colors";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const navigationRef = useRef(false);
  const insets = useSafeAreaInsets();

  const handleLogin = async ({ email, password }) => {
    if (loading || navigationRef.current) return;

    setLoading(true);
    const result = await signInWithEmail(email, password);

    if (result.success) {
      navigationRef.current = true;
      router.replace("/(tabs)");
    } else {
      Alert.alert("Login Failed", result.error);
    }

    setLoading(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.illustrationContainer}>
          <IllustrationContainer>
            <LoginIllustration />
          </IllustrationContainer>
        </View>

        <View style={styles.formContainer}>
          <AuthForm type="login" onSubmit={handleLogin} loading={loading} />
        </View>

        <View style={styles.links}>
          <View style={styles.forgotPasswordContainer}>
            <Link href="/(auth)/forgot-password" style={styles.forgotPassword}>
              Forgot Password?
            </Link>
          </View>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <Link href="/(auth)/register" style={styles.registerLink}>
              Sign Up
            </Link>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  illustrationContainer: {
    marginBottom: 20,
  },
  formContainer: {
    flex: 1,
    minHeight: 300,
  },
  links: {
    alignItems: "center",
    paddingVertical: 24,
    marginTop: 20,
  },
  forgotPasswordContainer: {
    marginBottom: 16,
  },
  forgotPassword: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  registerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  registerText: {
    color: Colors.gray600,
    fontSize: 14,
  },
  registerLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "500",
  },
});
