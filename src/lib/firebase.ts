import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// User provided Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAgKa97E_44GftkdbYcb8h35TsPEJG6fYw",
  authDomain: "seifinity.firebaseapp.com",
  projectId: "seifinity",
  storageBucket: "seifinity.firebasestorage.app",
  messagingSenderId: "973445601138",
  appId: "1:973445601138:web:61bbe5e462a1b3fb242feb",
  measurementId: "G-RWSX03E9BE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics (only if in browser environment)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
