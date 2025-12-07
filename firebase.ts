import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyASKIUaWQGxSXEyeKTOYfQ6MhlZjuuTUco",
  authDomain: "bd-library-manage.firebaseapp.com",
  projectId: "bd-library-manage",
  storageBucket: "bd-library-manage.appspot.com",
  messagingSenderId: "788192843084",
  appId: "1:788192843084:web:474880fb9b2f0ca5dcebe9",
  measurementId: "G-N4FS7LXSTS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get services
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };
