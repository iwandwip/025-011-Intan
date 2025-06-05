import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { useSettings } from "../../contexts/SettingsContext";
import { useTranslation } from "../../hooks/useTranslation";
import Button from "../../components/ui/Button";
import { signOutUser } from "../../services/authService";
import { formatAge } from "../../utils/ageCalculator";
import { getColors } from "../../constants/Colors";

function Home() {
  const { currentUser, userProfile } = useAuth();
  const { theme } = useSettings();
  const { t } = useTranslation();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const navigationRef = useRef(false);
  const colors = getColors(theme);

  const handleLogout = async () => {
    if (loggingOut || navigationRef.current) return;

    setLoggingOut(true);
    const result = await signOutUser();

    if (result.success) {
      navigationRef.current = true;
      router.replace("/(auth)/login");
    } else {
      Alert.alert("Logout Failed", "Failed to logout. Please try again.");
    }

    setLoggingOut(false);
  };

  const handleEditProfile = () => {
    router.push("/(tabs)/edit-profile");
  };

  const formatDate = (dateString) => {
    if (!dateString) return t("home.notSet");
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getWelcomeMessage = () => {
    if (userProfile?.name) {
      return `${t("home.welcome")} ${userProfile.name}!`;
    }
    return t("home.welcome");
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>{getWelcomeMessage()}</Text>

          {userProfile ? (
            <View style={styles.profileContainer}>
              <View style={styles.profileCard}>
                <Text style={styles.cardTitle}>{t("home.childProfile")}</Text>

                <View style={styles.profileRow}>
                  <Text style={styles.label}>{t("common.name")}:</Text>
                  <Text style={styles.value}>{userProfile.name}</Text>
                </View>

                <View style={styles.profileRow}>
                  <Text style={styles.label}>{t("common.age")}:</Text>
                  <Text style={styles.value}>
                    {formatAge(userProfile.birthdate)}
                  </Text>
                </View>

                <View style={styles.profileRow}>
                  <Text style={styles.label}>{t("common.gender")}:</Text>
                  <Text style={styles.value}>
                    {userProfile.gender === "male"
                      ? t("common.male")
                      : userProfile.gender === "female"
                      ? t("common.female")
                      : t("home.notSet")}
                  </Text>
                </View>

                <View style={styles.profileRow}>
                  <Text style={styles.label}>{t("common.birthDate")}:</Text>
                  <Text style={styles.value}>
                    {formatDate(userProfile.birthdate)}
                  </Text>
                </View>

                <View style={styles.profileRow}>
                  <Text style={styles.label}>{t("home.parent")}:</Text>
                  <Text style={styles.value}>{userProfile.parentName}</Text>
                </View>

                <View style={styles.profileRow}>
                  <Text style={styles.label}>{t("home.rfid")}:</Text>
                  <Text
                    style={[styles.value, !userProfile.rfid && styles.notSet]}
                  >
                    {userProfile.rfid || t("home.notAssigned")}
                  </Text>
                </View>

                <View style={styles.profileRow}>
                  <Text style={styles.label}>{t("home.role")}:</Text>
                  <Text style={styles.value}>{userProfile.role}</Text>
                </View>
              </View>

              <View style={styles.accountCard}>
                <Text style={styles.cardTitle}>
                  {t("home.accountInformation")}
                </Text>

                <View style={styles.profileRow}>
                  <Text style={styles.label}>{t("common.email")}:</Text>
                  <Text style={styles.value}>{currentUser?.email}</Text>
                </View>

                <View style={styles.profileRow}>
                  <Text style={styles.label}>User ID:</Text>
                  <Text style={styles.value}>{userProfile.id}</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>{t("common.loading")}</Text>
            </View>
          )}

          <View style={styles.actionsContainer}>
            <Button
              title={t("home.editProfile")}
              onPress={handleEditProfile}
              style={styles.editButton}
            />

            <Button
              title={loggingOut ? "Logging out..." : t("common.logout")}
              onPress={handleLogout}
              variant="outline"
              style={styles.logoutButton}
              disabled={loggingOut}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 24,
      paddingTop: 60,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: colors.gray900,
      marginBottom: 24,
      textAlign: "center",
    },
    profileContainer: {
      marginBottom: 32,
    },
    profileCard: {
      backgroundColor: colors.white,
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
      shadowColor: colors.shadow.color,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    accountCard: {
      backgroundColor: colors.white,
      borderRadius: 12,
      padding: 20,
      shadowColor: colors.shadow.color,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.gray900,
      marginBottom: 16,
      textAlign: "center",
    },
    profileRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.gray100,
    },
    label: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.gray600,
      flex: 1,
    },
    value: {
      fontSize: 14,
      color: colors.gray900,
      flex: 2,
      textAlign: "right",
    },
    notSet: {
      color: colors.gray400,
      fontStyle: "italic",
    },
    loadingContainer: {
      backgroundColor: colors.white,
      borderRadius: 12,
      padding: 32,
      alignItems: "center",
      marginBottom: 32,
    },
    loadingText: {
      fontSize: 16,
      color: colors.gray500,
    },
    actionsContainer: {
      gap: 12,
    },
    editButton: {
      marginBottom: 8,
    },
    logoutButton: {
      marginBottom: 8,
    },
  });

export default Home;
