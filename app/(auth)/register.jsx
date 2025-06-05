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
import RegisterIllustration from "../../components/illustrations/RegisterIllustration";
import { signUpWithEmail } from "../../services/authService";
import { Colors } from "../../constants/Colors";

export default function Register() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const navigationRef = useRef(false);
  const insets = useSafeAreaInsets();

  const handleRegister = async ({ email, password, profileData }) => {
    if (loading || navigationRef.current) return;

    setLoading(true);
    const result = await signUpWithEmail(email, password, profileData);

    if (result.success) {
      const isAdmin = email === "admin@gmail.com";

      Alert.alert(
        "Account Created",
        isAdmin
          ? "Admin account has been created successfully!"
          : "Your account has been created successfully! You can pair your RFID card from Edit Profile.",
        [
          {
            text: "OK",
            onPress: () => {
              navigationRef.current = true;
              if (isAdmin) {
                router.replace("/(admin)");
              } else {
                router.replace("/(tabs)");
              }
            },
          },
        ]
      );
    } else {
      Alert.alert("Registration Failed", result.error);
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
            <RegisterIllustration />
          </IllustrationContainer>
        </View>

        <View style={styles.formContainer}>
          <AuthForm
            type="register"
            onSubmit={handleRegister}
            loading={loading}
          />
        </View>

        <View style={styles.links}>
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <Link href="/(auth)/login" style={styles.loginLink}>
              Sign In
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
    minHeight: 400,
  },
  links: {
    alignItems: "center",
    paddingVertical: 20,
    marginTop: 20,
  },
  loginContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loginText: {
    color: Colors.gray600,
    fontSize: 14,
  },
  loginLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "500",
  },
});
