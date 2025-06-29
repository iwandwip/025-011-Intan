import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDxodg_DD4n-DTdKqrMEJJX3bQHJyG3sKU",
  authDomain: "intan-680a4.firebaseapp.com",
  databaseURL: "https://intan-680a4-default-rtdb.firebaseio.com/",
  projectId: "intan-680a4",
  storageBucket: "intan-680a4.firebasestorage.app",
  messagingSenderId: "177772813515",
  appId: "1:177772813515:web:5e07dc23cf8cb03bee0f4e",
  measurementId: "G-FHEDWPGDEV"
};

let app;
let auth;
let db;
let rtdb;

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} catch (error) {
  if (error.code === 'auth/already-initialized') {
    auth = getAuth(app);
  } else {
    console.warn('Auth initialization error:', error);
    auth = getAuth(app);
  }
}

try {
  db = getFirestore(app);
} catch (error) {
  console.error('Firestore initialization error:', error);
}

try {
  rtdb = getDatabase(app);
} catch (error) {
  console.error('Realtime Database initialization error:', error);
}

export { auth, db, rtdb, app };