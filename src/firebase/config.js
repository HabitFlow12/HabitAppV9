import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Capacitor } from '@capacitor/core';

const firebaseConfig = {
  apiKey: "AIzaSyAK3KSNQ60sZStGZ5ir_fn6VWPBkzUd_Oo",
  authDomain: "habit-app-f43cc.firebaseapp.com",
  projectId: "habit-app-f43cc",
  storageBucket: "habit-app-f43cc.firebasestorage.app",
  messagingSenderId: "387442825456",
  appId: "1:387442825456:web:5ff306ef842351197d4a35",
  measurementId: "G-X442N3W6V1"
};

// Initialize Firebase with error handling for Capacitor
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Retry initialization for Capacitor
  if (Capacitor.isNativePlatform()) {
    setTimeout(() => {
      try {
        app = initializeApp(firebaseConfig);
      } catch (retryError) {
        console.error('Firebase retry initialization error:', retryError);
      }
    }, 1000);
  }
}

export const auth = getAuth(app);
export const db = getFirestore(app);

// Add connection state monitoring for Capacitor
if (Capacitor.isNativePlatform()) {
  auth.onAuthStateChanged((user) => {
    console.log('Auth state changed:', user ? 'logged in' : 'logged out');
  });
}