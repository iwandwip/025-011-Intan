import React from "react";
import { Text } from "react-native";
import { Tabs } from "expo-router";
import { Colors } from "../../constants/Colors";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray500,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>🏠</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="timbang"
        options={{
          title: "Timbang",
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>⚖️</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="data-recap"
        options={{
          title: "Data Recap",
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>📊</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="edit-profile"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
