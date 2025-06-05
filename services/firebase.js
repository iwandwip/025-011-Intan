import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBuxWH92J_OBnbOBwfagBgrG1CspnIa4L0",
  authDomain: "belajarreactnative-43842.firebaseapp.com",
  projectId: "belajarreactnative-43842",
  storageBucket: "belajarreactnative-43842.firebasestorage.app",
  messagingSenderId: "946031336631",
  appId: "1:946031336631:web:4940d4f5af273442674132",
  measurementId: "G-QY68E41LQH"
};

let app;
let auth;
let db;

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

export { auth, db, app };