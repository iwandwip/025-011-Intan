import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../contexts/AuthContext";
import { SettingsProvider } from "../contexts/SettingsContext";
import ErrorBoundary from "../components/ErrorBoundary";

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <SettingsProvider>
        <AuthProvider>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(admin)" />
          </Stack>
        </AuthProvider>
      </SettingsProvider>
    </ErrorBoundary>
  );
}
