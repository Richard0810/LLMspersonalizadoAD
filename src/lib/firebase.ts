
// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDy895-0XNjfY2_HvvzUJ8dMRs8Ss4WH-Q",
  authDomain: "eduspark-ai-837vs.firebaseapp.com",
  projectId: "eduspark-ai-837vs",
  storageBucket: "eduspark-ai-837vs.firebasestorage.app",
  messagingSenderId: "637462240048",
  appId: "1:637462240048:web:f232354974c9a9298dc6f5"
};


// Initialize Firebase
// To avoid re-initializing on hot reloads
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
