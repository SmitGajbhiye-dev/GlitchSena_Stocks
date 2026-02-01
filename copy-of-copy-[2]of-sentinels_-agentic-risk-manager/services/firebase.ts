import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDNtn6WQLsNb-28I5r1PGPe_fq1VhspTeo",
  authDomain: "tekron-glitchsena.firebaseapp.com",
  projectId: "tekron-glitchsena",
  storageBucket: "tekron-glitchsena.firebasestorage.app",
  messagingSenderId: "781474291605",
  appId: "1:781474291605:web:48075faba0aee435f8a09c",
  measurementId: "G-XL10EFK4DT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
