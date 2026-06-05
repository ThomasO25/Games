// ============ firebase.js — init once, share auth + firestore ============
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, onSnapshot,
  collection, getDocs, addDoc, query, orderBy, limit,
  serverTimestamp, runTransaction, deleteField
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import {
  getAuth, onAuthStateChanged, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut, updateProfile
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCaA2z5CHJy_uXmdE-BWH_ktSVBOcCvBAk",
  authDomain: "games-7f424.firebaseapp.com",
  projectId: "games-7f424",
  storageBucket: "games-7f424.firebasestorage.app",
  messagingSenderId: "1048811721557",
  appId: "1:1048811721557:web:3effeb82d9befe156615dc",
  measurementId: "G-V7HRM78NFT"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export {
  db, auth,
  doc, getDoc, setDoc, updateDoc, onSnapshot,
  collection, getDocs, addDoc, query, orderBy, limit,
  serverTimestamp, runTransaction, deleteField,
  onAuthStateChanged, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut, updateProfile
};
