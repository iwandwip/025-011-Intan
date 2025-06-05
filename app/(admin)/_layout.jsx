import React from "react";
import { Text } from "react-native";
import { Tabs } from "expo-router";
import { useSettings } from "../../contexts/SettingsContext";
import { useTranslation } from "../../hooks/useTranslation";
import { getColors } from "../../constants/Colors";

export default function AdminLayout() {
  const { theme } = useSettings();
  const { t } = useTranslation();
  const colors = getColors(theme);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray500,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("common.home"),
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>🏠</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="all-users"
        options={{
          title: t("common.allUsers"),
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>👥</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("common.settings"),
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>⚙️</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="user-detail"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
