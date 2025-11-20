// scripts/alarms.js
// Alarms CRUD + local scheduling + stats

import { db } from "./firebase.js";
import { getCurrentUser, onUserChange } from "./auth.js";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const localAlarms = [];
let unsubscribeAlarms = null;
let schedulerStarted = false;

export function initAlarms() {
  const alarmListEl = document.getElementById("alarmList");
  const newAlarmTitle = document.getElementById("newAlarmTitle");
  const newAlarmTime = document.getElementById("newAlarmTime");
  const addAlarmBtn = document.getElementById("addAlarmBtn");
  const testAlarmBtn = document.getElementById("testAlarmBtn");
  const alarmSound = document.getElementById("alarmSound");

  addAlarmBtn.addEventListener("click", async () => {
    const user = getCurrentUser();
    if (!user) return alert("Please log in");
    const title = newAlarmTitle.value.trim();
    const time = newAlarmTime.value;
    if (!title || !time) return alert("Enter alarm label & time");
    try {
      const userAlarmsCol = collection(db, "users", user.uid, "alarms");
      await addDoc(userAlarmsCol, {
        title,
        time,
        active: true,
        createdAt: Date.now()
      });
      newAlarmTitle.value = "";
      newAlarmTime.value = "";
    } catch (err) {
      console.error(err);
      alert("Error adding alarm");
    }
  });

  testAlarmBtn.addEventListener("click", () => {
    playAlarm({ title: "Test Alarm", time: "Now" }, alarmSound);
  });

  onUserChange((user) => {
    if (unsubscribeAlarms) {
      unsubscribeAlarms();
      unsubscribeAlarms = null;
    }
    alarmListEl.innerHTML = "";
    localAlarms.length = 0;
    updateAlarmStats();
    if (user) subscribeAlarms(user.uid, alarmSound);
    if (!schedulerStarted) {
      schedulerStarted = true;
      scheduleLocalAlarms(alarmSound);
    }
  });
}

function subscribeAlarms(uid, alarmSound) {
  const alarmListEl = document.getElementById("alarmList");
  const userAlarmsCol = collection(db, "users", uid, "alarms");
  const qAlarms = query(userAlarmsCol, where("active", "==", true));

  unsubscribeAlarms = onSnapshot(qAlarms, (snapshot) => {
    alarmListEl.innerHTML = "";
    localAlarms.length = 0;
    snapshot.forEach((docSnap) => {
      const alarm = { id: docSnap.id, ...docSnap.data() };
      localAlarms.push(alarm);

      const item = document.createElement("div");
      item.className = "task-item";
      item.innerHTML = `
        <div class="task-content">
          <div class="task-title">${alarm.title}</div>
          <div class="task-time">${alarm.time}</div>
        </div>
        <button data-id="${alarm.id}" class="alarm-delete" style="border:none;background:none;color:#ef4444;cursor:pointer;">
          <i class="fas fa-trash"></i>
        </button>
      `;
      alarmListEl.appendChild(item);
    });

    alarmListEl.querySelectorAll(".alarm-delete").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        await deleteDoc(doc(db, "users", uid, "alarms", id));
      });
    });

    updateAlarmStats();
  });
}

function updateAlarmStats() {
  const active = localAlarms.length;
  document.getElementById("statActiveAlarms").textContent = active;
  document.getElementById("statCompleted").textContent = active ? "87%" : "0%";
  document.getElementById("statRecurring").textContent = Math.min(active, 4);
}

function scheduleLocalAlarms(alarmSound) {
  setInterval(() => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const currentTime = `${hh}:${mm}`;
    localAlarms.forEach((a) => {
      if (a.time === currentTime) {
        playAlarm(a, alarmSound);
      }
    });
  }, 30000);
}

function playAlarm(alarm, alarmSound) {
  try {
    alarmSound.currentTime = 0;
    alarmSound.play();
  } catch (e) {
    console.error(e);
  }
  alert("Alarm: " + alarm.title + " (" + alarm.time + ")");
}
