// scripts/auth.js
// Login / signup overlay + user state

import { auth } from "./firebase.js";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

let currentUser = null;
const listeners = [];

export function getCurrentUser() {
  return currentUser;
}

export function onUserChange(cb) {
  listeners.push(cb);
  if (currentUser) cb(currentUser);
}

function notify(user) {
  listeners.forEach((cb) => cb(user));
}

export function initAuth() {
  const authScreen = document.getElementById("auth-screen");
  const authTabs = document.querySelectorAll(".auth-tab");
  const authEmail = document.getElementById("authEmail");
  const authPassword = document.getElementById("authPassword");
  const authActionBtn = document.getElementById("authActionBtn");
  const authNote = document.getElementById("authNote");
  const userAvatar = document.getElementById("userAvatar");
  const logoutBtn = document.getElementById("logoutBtn");
  let authMode = "login";

  authTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      authTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      authMode = tab.dataset.mode;
      if (authMode === "login") {
        authActionBtn.textContent = "Login";
        authNote.textContent = "No account yet? Switch to Sign up tab.";
      } else {
        authActionBtn.textContent = "Sign up";
        authNote.textContent = "Already have an account? Switch to Login tab.";
      }
    });
  });

  authActionBtn.addEventListener("click", async () => {
    const email = authEmail.value.trim();
    const password = authPassword.value.trim();
    if (!email || !password) {
      alert("Please fill email & password");
      return;
    }
    try {
      if (authMode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  });

  logoutBtn.addEventListener("click", () => {
    signOut(auth);
  });

  onAuthStateChanged(auth, (user) => {
    currentUser = user || null;
    if (user) {
      authScreen.style.display = "none";
      userAvatar.textContent = (user.email?.charAt(0) || "L").toUpperCase();
    } else {
      authScreen.style.display = "flex";
      userAvatar.textContent = "LS";
    }
    notify(currentUser);
  });
}
