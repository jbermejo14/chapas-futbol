import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged, updateProfile, User } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCvTIZ3kWDbCatfsxAPHjGCOvMcahkYLBI",
  authDomain: "chapas-d2490.firebaseapp.com",
  projectId: "chapas-d2490",
  storageBucket: "chapas-d2490.firebasestorage.app",
  messagingSenderId: "677069686065",
  appId: "1:677069686065:web:1855b8a5d7aa72ab955c10",
  measurementId: "G-66S4DQ3BF6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db, signInAnonymously, onAuthStateChanged, updateProfile };
export type { User };
