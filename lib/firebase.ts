// app/lib/firebase.ts
import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ⚠️ Reemplaza estos valores por los de tu consola de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDA-OVdyfn_VVjLOsdDw-pD_GczPjEqNYs",
  authDomain: "spotmytrash.firebaseapp.com",
  projectId: "spotmytrash",
  storageBucket: "spotmytrash.firebasestorage.app",
  messagingSenderId: "857659224159",
  appId: "1:857659224159:web:79fcae30aa89c7d11d6bea"
};

// Evita inicializar dos veces en dev
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
