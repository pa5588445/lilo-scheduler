// scripts/firebase.js
// Firebase core config + exports

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA56UYKWpIRj0VvyMOTCqoxRAdCiYjCwrw",
  authDomain: "lilo-scheduler-57cdb.firebaseapp.com",
  projectId: "lilo-scheduler-57cdb",
  storageBucket: "lilo-scheduler-57cdb.firebasestorage.app",
  messagingSenderId: "786947116688",
  appId: "1:786947116688:web:509bae2ebcabd4ff60d215",
  measurementId: "G-B1LMYRF3H6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log("🔥 Firebase initialised");

export { app, auth, db };
