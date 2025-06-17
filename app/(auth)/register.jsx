import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  StatusBar,
  RefreshControl,
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
  const [refreshing, setRefreshing] = useState(false);
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
        "Akun Berhasil Dibuat",
        isAdmin
          ? "Akun admin berhasil dibuat!"
          : "Akun Anda berhasil dibuat! Anda dapat memasang kartu RFID dari Ubah Profil.",
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
      Alert.alert("Registrasi Gagal", result.error);
    }

    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
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
            <Text style={styles.loginText}>Sudah punya akun? </Text>
            <Link href="/(auth)/login" style={styles.loginLink}>
              Masuk
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
