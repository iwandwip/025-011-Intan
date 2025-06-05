import React, { createContext, useState, useContext, useEffect } from "react";
import { auth } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getUserProfile } from "../services/userService";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      currentUser: null,
      userProfile: null,
      loading: false,
      authInitialized: true,
      refreshProfile: () => {},
    };
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  const loadUserProfile = async (user) => {
    if (!user) {
      setUserProfile(null);
      return;
    }

    try {
      const result = await getUserProfile(user.uid);
      if (result.success) {
        setUserProfile(result.profile);
      } else {
        console.warn("Failed to load user profile:", result.error);
        setUserProfile(null);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      setUserProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (currentUser) {
      await loadUserProfile(currentUser);
    }
  };

  useEffect(() => {
    let unsubscribe = null;
    let mounted = true;

    const initializeAuth = () => {
      if (!auth) {
        if (mounted) {
          setCurrentUser(null);
          setUserProfile(null);
          setLoading(false);
          setAuthInitialized(true);
        }
        return;
      }

      try {
        unsubscribe = onAuthStateChanged(
          auth,
          async (user) => {
            if (mounted) {
              setCurrentUser(user);
              await loadUserProfile(user);
              setLoading(false);
              setAuthInitialized(true);
            }
          },
          (error) => {
            console.error("Auth state change error:", error);
            if (mounted) {
              setCurrentUser(null);
              setUserProfile(null);
              setLoading(false);
              setAuthInitialized(true);
            }
          }
        );
      } catch (error) {
        console.error("Failed to initialize auth listener:", error);
        if (mounted) {
          setCurrentUser(null);
          setUserProfile(null);
          setLoading(false);
          setAuthInitialized(true);
        }
      }
    };

    const timeoutId = setTimeout(() => {
      if (mounted && loading && !authInitialized) {
        console.warn("Auth initialization timeout, proceeding anyway");
        setCurrentUser(null);
        setUserProfile(null);
        setLoading(false);
        setAuthInitialized(true);
      }
    }, 10000);

    initializeAuth();

    return () => {
      mounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
      clearTimeout(timeoutId);
    };
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    authInitialized,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
