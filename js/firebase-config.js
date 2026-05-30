/**
 * PRUVA — Firebase Configuration
 * 
 * API key'leri .env dosyasından okunur (VITE_ prefix'i ile).
 * Vite build sırasında bu değerler inline edilir.
 * 
 * SECURITY NOTE:
 * Firebase client-side API keys are inherently public. However, for production:
 * 1. Enable Firebase App Check to prevent unauthorized API usage.
 * 2. Restrict the API key in Google Cloud Console (HTTP referrers, allowed APIs).
 * 3. Configure Firestore Security Rules to protect data access.
 * 4. Enable Firebase Authentication restrictions (authorized domains).
 */
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Global exposure for the vanilla JS project structure
window.fbApp = app;
window.fbAnalytics = analytics;
window.fbAuth = auth;
window.fbDb = db;
window.fbStorage = storage;

console.log('[FIREBASE] Pruva Firebase SDK initialized successfully');

export { app, analytics, auth, db, storage };
