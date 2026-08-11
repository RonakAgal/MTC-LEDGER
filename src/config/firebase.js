import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBR2Fnau4p-k-VpWo6jIYs1wgpTbolC9Lc",
  authDomain: "mtc-ledger.firebaseapp.com",
  projectId: "mtc-ledger",
  storageBucket: "mtc-ledger.firebasestorage.app",
  messagingSenderId: "790765329402",
  appId: "1:790765329402:web:842eef7ae29f2fd4382243",
  measurementId: "G-E0RJH4L3RX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
