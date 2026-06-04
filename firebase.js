// ============ firebase.js — initialise once, share everywhere ============
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, onSnapshot,
  collection, getDocs, serverTimestamp, runTransaction, deleteField
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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

// analytics is optional; guard it so a blocked/insecure context can't break the page
try {
  const { getAnalytics } = await import("https://www.gstatic.com/firebasejs/12.14.0/firebase-analytics.js");
  getAnalytics(app);
} catch (e) { /* fine without it */ }

export { db, doc, getDoc, setDoc, updateDoc, onSnapshot, collection, getDocs, serverTimestamp, runTransaction, deleteField };
