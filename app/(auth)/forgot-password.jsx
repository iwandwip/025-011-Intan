import React, { useState } from "react";
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
import ForgotPasswordIllustration from "../../components/illustrations/ForgotPasswordIllustration";
import { resetPassword } from "../../services/authService";
import { Colors } from "../../constants/Colors";

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleResetPassword = async ({ email }) => {
    if (loading) return;

    setLoading(true);
    const result = await resetPassword(email);

    if (result.success) {
      Alert.alert(
        "Email Terkirim",
        "Email reset password telah dikirim ke alamat email Anda.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      Alert.alert("Reset Gagal", result.error);
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
            <ForgotPasswordIllustration />
          </IllustrationContainer>
        </View>

        <Text style={styles.description}>
          Masukkan alamat email Anda dan kami akan mengirimkan link untuk reset
          password.
        </Text>

        <View style={styles.formContainer}>
          <AuthForm
            type="forgot-password"
            onSubmit={handleResetPassword}
            loading={loading}
          />
        </View>

        <View style={styles.links}>
          <Link href="/(auth)/login" style={styles.link}>
            Kembali ke Login
          </Link>
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
  description: {
    fontSize: 16,
    color: Colors.gray600,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  formContainer: {
    flex: 1,
    minHeight: 200,
  },
  links: {
    alignItems: "center",
    paddingVertical: 24,
    marginTop: 20,
  },
  link: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "500",
  },
});
