// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  "projectId": "eduspark-ai-837vs",
  "appId": "1:637462240048:web:bcf0d49b43e8c4c08dc6f5",
  "storageBucket": "eduspark-ai-837vs.firebasestorage.app",
  "apiKey": "AIzaSyAAU1Al3JlmckfzEGD69mHd3y7WFv6TYaM",
  "authDomain": "eduspark-ai-837vs.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "637462240048"
};

// Initialize Firebase
// To avoid re-initializing on hot reloads
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
