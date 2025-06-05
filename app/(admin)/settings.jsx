import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useSettings } from "../../contexts/SettingsContext";
import { useTranslation } from "../../hooks/useTranslation";
import { getColors } from "../../constants/Colors";

export default function AdminSettings() {
  const { language, theme, changeLanguage, changeTheme } = useSettings();
  const { t } = useTranslation();
  const colors = getColors(theme);

  const handleLanguageChange = async (newLanguage) => {
    await changeLanguage(newLanguage);
    Alert.alert(
      t("settings.languageChanged"),
      t("settings.languageChangedDesc")
    );
  };

  const handleThemeChange = async (newTheme) => {
    await changeTheme(newTheme);
    Alert.alert(t("settings.themeChanged"), t("settings.themeChangedDesc"));
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>{t("settings.title")}</Text>
          <Text style={styles.subtitle}>{t("settings.subtitle")}</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("settings.language")}</Text>
            <Text style={styles.sectionDescription}>
              {t("settings.languageDesc")}
            </Text>

            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  language === "id" && styles.optionButtonActive,
                ]}
                onPress={() => handleLanguageChange("id")}
              >
                <Text
                  style={[
                    styles.optionText,
                    language === "id" && styles.optionTextActive,
                  ]}
                >
                  🇮🇩 {t("settings.indonesian")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionButton,
                  language === "en" && styles.optionButtonActive,
                ]}
                onPress={() => handleLanguageChange("en")}
              >
                <Text
                  style={[
                    styles.optionText,
                    language === "en" && styles.optionTextActive,
                  ]}
                >
                  🇺🇸 {t("settings.english")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("settings.theme")}</Text>
            <Text style={styles.sectionDescription}>
              {t("settings.themeDesc")}
            </Text>

            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  theme === "light" && styles.optionButtonActive,
                ]}
                onPress={() => handleThemeChange("light")}
              >
                <Text
                  style={[
                    styles.optionText,
                    theme === "light" && styles.optionTextActive,
                  ]}
                >
                  ☀️ {t("settings.lightMode")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionButton,
                  theme === "dark" && styles.optionButtonActive,
                ]}
                onPress={() => handleThemeChange("dark")}
              >
                <Text
                  style={[
                    styles.optionText,
                    theme === "dark" && styles.optionTextActive,
                  ]}
                >
                  🌙 {t("settings.darkMode")}
                </Text>
              </TouchableOpacity>
            </View>
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
      marginBottom: 8,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 16,
      color: colors.gray600,
      textAlign: "center",
      marginBottom: 32,
    },
    section: {
      backgroundColor: colors.white,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      shadowColor: colors.shadow.color,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.gray900,
      marginBottom: 8,
    },
    sectionDescription: {
      fontSize: 14,
      color: colors.gray600,
      marginBottom: 16,
      lineHeight: 20,
    },
    optionsContainer: {
      gap: 12,
    },
    optionButton: {
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.gray200,
      backgroundColor: colors.background,
    },
    optionButtonActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + "20",
    },
    optionText: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.gray700,
      textAlign: "center",
    },
    optionTextActive: {
      color: colors.primary,
      fontWeight: "600",
    },
  });
