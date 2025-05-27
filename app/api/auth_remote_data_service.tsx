import { getAuth, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { router } from 'expo-router';
import { auth, firestore } from '../firebaseConfig'; // Import auth and firestore from centralized config
// import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserData, CreateUserDTO, UpdateUserDTO } from '../../types/user'; // Import the types

// Function to register a new user
export const registerUser = async (email: string, password: string, username: string) => {
    try {
        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update user profile with name
        await updateProfile(user, {
            displayName: username
        });

        // Store additional user data in Firestore
        await setDoc(doc(firestore, 'users', user.uid), {
            name: username,
            email,
            role: 'user',
            createdAt: new Date().toISOString(),
            // Add any additional user data you want to store
        });

        console.log("User registered successfully:", user);
        return { user };
    } catch (error: any) {
        console.error("Registration error:", error);
        // Rethrow with specific error messages
        if (error.code === 'auth/email-already-in-use') {
            throw new Error('Email is already registered. Please use a different email.');
        } else if (error.code === 'auth/invalid-email') {
            throw new Error('Invalid email address.');
        } else if (error.code === 'auth/weak-password') {
            throw new Error('Password should be at least 6 characters.');
        }
        throw new Error('An error occurred during registration. Please try again.');
    }
};

// Function to log in a user
export const loginUser = async (email: string, password: string): Promise<{ user: UserData }> => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        // console.log("User logged in successfully:", user);

        // Fetch additional user data from Firestore
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        if (!userDoc.exists()) {
            throw new Error('User data not found in Firestore.');
        }

        // Combine Firestore data with Firebase user data
        const userData = {
            id: user.uid,
            email: user.email,
            displayName: user.displayName,
            ...userDoc.data() // Spread the Firestore user data
        };

        return { user: userData };
    } catch (error: any) {
        console.error("Login error:", error.message);
        // Rethrow with specific error messages
        if (error.code === 'auth/invalid-email') {
            throw new Error('Invalid email address.');
        } else if (error.code === 'auth/user-not-found') {
            throw new Error('No user found with this email.');
        } else if (error.code === 'auth/wrong-password') {
            throw new Error('Incorrect password.');
        } else if (error.code === 'auth/invalid-credential') {
            throw new Error('Invalid credentials provided.');
        }
        throw new Error('An error occurred during login. Please try again.');
    }
};

// Function to reset password
export const resetPassword = async (email: string) => {
    try {
        await sendPasswordResetEmail(auth, email);
        // console.log("Password reset email sent");
        return { success: true };
    } catch (error: any) {
        console.error("Password reset error:", error.message);
        throw error; // Rethrow the error to handle it in the component
    }
};

export const storeFCMToken = async (userId: string, token: string, deviceInfo: any) => {
    try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL;
        const response = await fetch(`${apiUrl}/notifications/store-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                token,
                deviceInfo
            }),
        });
        
        if (!response.ok) {
            throw new Error('Failed to store FCM token');
        }
        
        return { success: true };
    } catch (error: any) {
        console.error("FCM token storage error:", error.message);
        throw error;
    }
};

// Function to get the current user
export const getCurrentUser = () => {
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, 
            (user) => {
                unsubscribe(); // Unsubscribe once we get the value
                if (user) {
                    console.log("Current user:", user);
                    resolve(user);
                } else {
                    console.log("No user is signed in");
                    resolve(null);
                }
            },
            (error) => {
                reject(error);
            }
        );
    });
};

// Function to sign out
export const signOutUser = async () => {
    try {
        await signOut(auth);
        // await GoogleSignin.signOut();
        // Sign out from Firebase
        console.log("User signed out successfully");
        return { success: true };
    } catch (error: any) {
        console.error("Sign out error:", error.message);
        throw error;
    }
};

export const handleGoogleSignIn = async () => {
    // try {
    //     GoogleSignin.configure({
    //         offlineAccess: false,
    //         webClientId: '1080539362985-965qhgmagj5c6ghq79lt905htvdov6jo.apps.googleusercontent.com',
    //         scopes: ['profile', 'email'],
    //     });
        
    //     await GoogleSignin.hasPlayServices();
    //     const userInfo = await GoogleSignin.signIn();
        
    //     console.log('User Info:', userInfo); // Log the userInfo to check its structure

    //     // Get the ID token and create Firebase credentials
    //     const { idToken } = await GoogleSignin.getTokens();
    //     const googleCredential = GoogleAuthProvider.credential(idToken);
    //     const userCredential = await signInWithCredential(auth, googleCredential);
        
    //     // Access user data from the response
    //     const userData = userInfo.data?.user; // Access the user object from the response

    //     // Check if user exists in Firestore
    //     const userDoc = await getDoc(doc(firestore, 'users', userCredential.user.uid));
        
    //     if (!userDoc.exists()) {
    //         // Create new user document in Firestore
    //         await setDoc(doc(firestore, 'users', userCredential.user.uid), {
    //             name: userData?.name, // Use userData.name
    //             email: userData?.email, // Use userData.email
    //             createdAt: new Date().toISOString(),
    //             photoURL: userData?.photo, // Use userData.photo
    //             provider: 'google'
    //         });
    //     }

    //     // Store user data in AsyncStorage
    //     await AsyncStorage.setItem('userData', JSON.stringify({
    //         uid: userCredential.user.uid,
    //         email: userCredential.user.email,
    //         displayName: userData?.name, // Use userData.name
    //         photoURL: userData?.photo // Use userData.photo
    //     }));

    //     router.push('/(root)/(tabs)/profile');
    //     console.log('=> Google Sign In successful', userInfo);
    //     return userInfo;
    // } catch (error) {
    //     console.error('=> Google Sign In error', error);
    //     throw new Error('Failed to sign in with Google');
    // }
};