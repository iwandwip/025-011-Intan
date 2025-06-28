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
      isAdmin: false,
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
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminStatus = (user, profile) => {
    return (
      user?.email === "admin@gmail.com" ||
      profile?.role === "teacher" ||
      profile?.isAdmin
    );
  };

  const loadUserProfile = async (user, retryCount = 0) => {
    if (!user) {
      setUserProfile(null);
      setIsAdmin(false);
      return;
    }

    try {
      const result = await getUserProfile(user.uid);
      if (result.success) {
        const adminStatus = checkAdminStatus(user, result.profile);
        setIsAdmin(adminStatus);
        setUserProfile(result.profile);
        console.log("User profile loaded successfully");
      } else {
        const adminStatus = checkAdminStatus(user, null);
        setIsAdmin(adminStatus);

        if (adminStatus) {
          setUserProfile({
            id: user.uid,
            email: user.email,
            name: "Admin",
            role: "teacher",
            isAdmin: true,
          });
        } else {
          console.warn("Failed to load user profile:", result.error);
          // Retry mechanism
          if (retryCount === 0) {
            console.log("Retrying profile load in 2 seconds...");
            setTimeout(() => loadUserProfile(user, 1), 2000);
          } else {
            setUserProfile(null);
          }
        }
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      const adminStatus = checkAdminStatus(user, null);
      setIsAdmin(adminStatus);

      if (adminStatus) {
        setUserProfile({
          id: user.uid,
          email: user.email,
          name: "Admin",
          role: "teacher",
          isAdmin: true,
        });
      } else {
        // Retry on network error
        if (retryCount === 0) {
          console.log("Retrying profile load in 2 seconds due to network error...");
          setTimeout(() => loadUserProfile(user, 1), 2000);
        } else {
          setUserProfile(null);
        }
      }
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

    const initializeAuth = async () => {
      if (!auth) {
        if (mounted) {
          setCurrentUser(null);
          setUserProfile(null);
          setLoading(false);
          setAuthInitialized(true);
          setIsAdmin(false);
        }
        return;
      }

      try {
        // Check existing user FIRST before setting up listener
        const currentAuthUser = auth.currentUser;
        if (currentAuthUser && mounted) {
          console.log("Found existing authenticated user:", currentAuthUser.email);
          setCurrentUser(currentAuthUser);
          await loadUserProfile(currentAuthUser);
          setLoading(false);
          setAuthInitialized(true);
        }

        // Setup listener for future auth state changes
        unsubscribe = onAuthStateChanged(
          auth,
          async (user) => {
            if (mounted) {
              console.log("Auth state changed:", user ? `User: ${user.email}` : "Logged out");
              setCurrentUser(user);
              await loadUserProfile(user);
              setLoading(false);
              setAuthInitialized(true);
            }
          },
          (error) => {
            console.error("Auth state change error:", error);
            if (mounted) {
              // Don't clear user on error - just mark as initialized
              setLoading(false);
              setAuthInitialized(true);
            }
          }
        );
      } catch (error) {
        console.error("Failed to initialize auth listener:", error);
        if (mounted) {
          // Don't clear user on error - just mark as initialized
          setLoading(false);
          setAuthInitialized(true);
        }
      }
    };

    const timeoutId = setTimeout(() => {
      if (mounted && loading && !authInitialized) {
        console.warn("Auth initialization timeout, proceeding anyway");
        // Don't reset user - just mark as initialized and stop loading
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
    isAdmin,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
