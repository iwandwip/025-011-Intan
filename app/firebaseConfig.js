import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDPHpVgwHMWCvRdHHSlvopTHuXw0WgzVYI",
  authDomain: "intan-28dc8.firebaseapp.com",
  databaseURL: "https://intan-28dc8-default-rtdb.firebaseio.com",
  projectId: "intan-28dc8",
  storageBucket: "intan-28dc8.firebasestorage.app",
  messagingSenderId: "503169173241",
  appId: "1:503169173241:web:8ebe7d0e198d75345b4428"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const firestore = getFirestore(app);
const auth = getAuth(app);
const googleAuthProvider = new GoogleAuthProvider();

export { database, firestore, auth, googleAuthProvider }; 