import { initializeApp } from "firebase/app";
import type { Firestore } from "firebase/firestore";
import type { Functions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyAdZy_OGph3BeMs0CqwjYkV7NNQR40MjJQ",
  authDomain: "superkreatives-product-data.firebaseapp.com",
  projectId: "superkreatives-product-data",
  storageBucket: "superkreatives-product-data.firebasestorage.app",
  messagingSenderId: "942901361121",
  appId: "1:942901361121:web:f17909f805333fd79f7aa0",
};

let firestoreInstance: Firestore | null = null;
let firebaseFunctions: Functions | null = null;

export async function getFirestoreInstance() {
  if (!firestoreInstance) {
    const { getFirestore } = await import("firebase/firestore");
    const app = initializeApp(firebaseConfig);
    firestoreInstance = getFirestore(app);
  }
  return firestoreInstance;
}

export async function getFirebaseFunctions() {
  if (!firebaseFunctions) {
    const { getFunctions } = await import("firebase/functions");
    const app = initializeApp(firebaseConfig);
    firebaseFunctions = getFunctions(app);
  }
  return firebaseFunctions;
}
