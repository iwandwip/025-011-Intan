import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");
  const [theme, setTheme] = useState("light");
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem("app_language");
      const savedTheme = await AsyncStorage.getItem("app_theme");

      if (savedLanguage) setLanguage(savedLanguage);
      if (savedTheme) setTheme(savedTheme);
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const changeLanguage = async (newLanguage) => {
    try {
      setLanguage(newLanguage);
      await AsyncStorage.setItem("app_language", newLanguage);
    } catch (error) {
      console.error("Error saving language:", error);
    }
  };

  const changeTheme = async (newTheme) => {
    try {
      setTheme(newTheme);
      await AsyncStorage.setItem("app_theme", newTheme);
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const value = {
    language,
    theme,
    loading,
    changeLanguage,
    changeTheme,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
