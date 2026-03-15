
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "eduspark-ai-837vs.firebaseapp.com",
  projectId: "eduspark-ai-837vs",
  storageBucket: "eduspark-ai-837vs.firebasestorage.app",
  messagingSenderId: "637462240048",
  appId: "1:637462240048:web:f232354974c9a9298dc6f5"
};

// Initialize Firebase safely for Build/SSR environments
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

// Solo inicializar si hay una API Key, para evitar errores en el build de Vercel
if (typeof window !== 'undefined' || firebaseConfig.apiKey) {
  try {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
  } catch (error) {
    console.error("Error initializing Firebase:", error);
  }
}

export { app, db, auth };
