import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from './firebase';
import { createUserProfile } from './userService';

const handleAuthError = (error) => {
  const errorMessages = {
    'auth/user-not-found': 'No user found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/email-already-in-use': 'Email is already registered.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/invalid-credential': 'Invalid email or password.',
  };
  return errorMessages[error.code] || error.message;
};

const isAdminEmail = (email) => {
  return email === 'admin@gmail.com';
};

export const signInWithEmail = async (email, password) => {
  try {
    if (!auth) {
      throw new Error('Firebase Auth is not initialized');
    }
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: handleAuthError(error) };
  }
};

export const signUpWithEmail = async (email, password, profileData) => {
  try {
    if (!auth) {
      throw new Error('Firebase Auth is not initialized');
    }

    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    let profilePayload;
    
    if (isAdminEmail(email)) {
      profilePayload = {
        email,
        name: 'Admin',
        role: 'teacher',
        isAdmin: true
      };
    } else {
      profilePayload = {
        email,
        ...profileData,
        role: 'student',
        isAdmin: false
      };
    }

    const profileResult = await createUserProfile(result.user.uid, profilePayload);

    if (!profileResult.success) {
      await result.user.delete();
      throw new Error(profileResult.error);
    }

    return { success: true, user: result.user, profile: profileResult.profile };
  } catch (error) {
    return { success: false, error: handleAuthError(error) };
  }
};

export const signOutUser = async () => {
  try {
    if (!auth) {
      throw new Error('Firebase Auth is not initialized');
    }
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: handleAuthError(error) };
  }
};

export const resetPassword = async (email) => {
  try {
    if (!auth) {
      throw new Error('Firebase Auth is not initialized');
    }
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error: handleAuthError(error) };
  }
};