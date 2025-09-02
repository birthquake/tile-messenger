// Import Firebase core and services
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD20XtFQyxHxkiD_hP8cEs4wHb-_Ec1a4s",
  authDomain: "tiletalk-723ad.firebaseapp.com",
  projectId: "tiletalk-723ad",
  storageBucket: "tiletalk-723ad.firebasestorage.app",
  messagingSenderId: "422643503965",
  appId: "1:422643503965:web:1a2b5e33935e70b61f0eb4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const db = getFirestore(app);
export const auth = getAuth(app);
