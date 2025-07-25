// utils/firebaseInit.ts
// Place this file in your project and import it BEFORE any other Firebase imports
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, initializeFirestore, memoryLocalCache, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {

     apiKey: "AIzaSyA0HdeDYIv38UHICf7tsFaXWtFNG_5WUSE",
  authDomain: "afood-a8ea4.firebaseapp.com",
  projectId: "afood-a8ea4",
  storageBucket: "afood-a8ea4.firebasestorage.app",
  messagingSenderId: "555100471697",
  appId: "1:555100471697:web:c259b06146389fa9901a30"

};


// This is used to track if we've already initialized Firebase
let initialized = false;

// Initialize Firebase and return the instances
export const initializeFirebase = () => {
    // Only initialize once
    if (initialized) {
        return;
    }

    console.log("Initializing Firebase");

    try {
        // Check if Firebase is already initialized
        if (getApps().length === 0) {
            initializeApp(firebaseConfig);
            console.log("Firebase app initialized");
        } else {
            console.log("Firebase app already initialized");
        }

        // Mark as initialized to prevent duplicate initialization
        initialized = true;
    } catch (error) {
        console.error("Error initializing Firebase:", error);
        throw error;
    }
};

// Export a function to safely get the Firebase app
export const getFirebaseApp = (): FirebaseApp => {
    // Make sure Firebase is initialized
    if (!initialized) {
        initializeFirebase();
    }

    // Get the first app if it exists
    const apps = getApps();
    if (apps.length === 0) {
        throw new Error("Firebase app is not initialized");
    }

    return apps[0];
};

// Call initialize right away to ensure Firebase is set up early
try {
    initializeFirebase();
} catch (error) {
    console.error("Failed to initialize Firebase during module load:", error);
}

// Export default for convenient imports
export default { initializeFirebase, getFirebaseApp };