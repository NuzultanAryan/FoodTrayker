import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCJr5zJsWK4uSKxk4z1CEQ0Po9ADlT3De4",
  authDomain: "foodtrayker.firebaseapp.com",
  projectId: "foodtrayker",
  storageBucket: "foodtrayker.firebasestorage.app",
  messagingSenderId: "933520332009",
  appId: "1:933520332009:web:c3c6a7e01b0efcf140cc78",
  measurementId: "G-8YDVTGMHN1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);