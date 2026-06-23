import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "saarthi-e1f8d.firebaseapp.com",
  projectId: "saarthi-e1f8d",
  storageBucket: "saarthi-e1f8d.firebasestorage.app",
  messagingSenderId: "1010930833916",
  appId: "1:1010930833916:web:b52277879e7ab659943a79"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app)
const provider = new GoogleAuthProvider()

export {auth , provider}

