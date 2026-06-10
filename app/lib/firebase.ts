import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "mock-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "mock-project.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mock-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "mock-project.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1234567890:web:1234567890"
};

const isConfigured = !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

let db: any = null;
let isEmulatorActive = false;

try {
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);

  // Connect to emulator in development if not configured or if emulator requested
  if (
    process.env.NODE_ENV === "development" &&
    (!isConfigured || process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true")
  ) {
    connectFirestoreEmulator(db, "localhost", 8080);
    isEmulatorActive = true;
    console.log("🔌 Connected to local Firestore Emulator (localhost:8080)");
  } else {
    console.log("☁️ Connected to Cloud Firestore");
  }
} catch (error) {
  console.error("⚠️ Failed to initialize Firebase Client SDK:", error);
}

export { db, isEmulatorActive, isConfigured };
