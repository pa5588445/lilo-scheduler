// scripts/tasks.js
// Tasks CRUD + DS visualisation (FIFO / LIFO)

import { db } from "./firebase.js";
import { getCurrentUser, onUserChange } from "./auth.js";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const fifoQueue = [];
const lifoStack = [];
let unsubscribeTasks = null;

export function initTasks() {
  const todoListEl = document.getElementById("todoList");
  const newTaskTitle = document.getElementById("newTaskTitle");
  const newTaskTime = document.getElementById("newTaskTime");
  const addTaskBtn = document.getElementById("addTaskBtn");

  addTaskBtn.addEventListener("click", async () => {
    const user = getCurrentUser();
    if (!user) return alert("Please log in");
    const title = newTaskTitle.value.trim();
    const time = newTaskTime.value;
    if (!title) return alert("Enter task title");
    try {
      const userTasksCol = collection(db, "users", user.uid, "tasks");
      await addDoc(userTasksCol, {
        title,
        time,
        type: "todo",
        done: false,
        createdAt: Date.now()
      });
      newTaskTitle.value = "";
      newTaskTime.value = "";
    } catch (err) {
      console.error(err);
      alert("Error adding task");
    }
  });

  document.getElementById("dequeueBtn").addEventListener("click", () => {
    if (!fifoQueue.length) return alert("Queue empty");
    const t = fifoQueue.shift();
    alert("Dequeued (FIFO): " + t.title);
    renderDSViews();
  });

  document.getElementById("popBtn").addEventListener("click", () => {
    if (!lifoStack.length) return alert("Stack empty");
    const t = lifoStack.pop();
    alert("Popped (LIFO): " + t.title);
    renderDSViews();
  });

  onUserChange((user) => {
    if (unsubscribeTasks) {
      unsubscribeTasks();
      unsubscribeTasks = null;
    }
    todoListEl.innerHTML = "";
    clearDS();
    if (user) subscribeTasks(user.uid);
  });
}

function subscribeTasks(uid) {
  const todoListEl = document.getElementById("todoList");
  const userTasksCol = collection(db, "users", uid, "tasks");
  const qTasks = query(userTasksCol, where("type", "==", "todo"));

  unsubscribeTasks = onSnapshot(qTasks, (snapshot) => {
    todoListEl.innerHTML = "";
    const allTasks = [];
    snapshot.forEach((docSnap) => {
      const task = { id: docSnap.id, ...docSnap.data() };
      allTasks.push(task);

      const item = document.createElement("div");
      item.className = "task-item";
      item.innerHTML = `
        <div class="task-checkbox ${task.done ? "checked" : ""}" data-id="${task.id}">
          <i class="fas fa-check"></i>
        </div>
        <div class="task-content">
          <div class="task-title">${task.title}</div>
          <div class="task-time">${task.time || "Anytime"}</div>
        </div>
        <button data-del="${task.id}" style="border:none;background:none;color:#ef4444;cursor:pointer;">
          <i class="fas fa-trash"></i>
        </button>
      `;
      todoListEl.appendChild(item);
    });

    todoListEl.querySelectorAll(".task-checkbox").forEach((cb) => {
      cb.addEventListener("click", async () => {
        const id = cb.getAttribute("data-id");
        const ref = doc(db, "users", uid, "tasks", id);
        const isChecked = cb.classList.contains("checked");
        await updateDoc(ref, { done: !isChecked });
      });
    });

    todoListEl.querySelectorAll("[data-del]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-del");
        await deleteDoc(doc(db, "users", uid, "tasks", id));
      });
    });

    rebuildDataStructures(allTasks);
  });
}

function clearDS() {
  fifoQueue.length = 0;
  lifoStack.length = 0;
  renderDSViews();
}

function rebuildDataStructures(tasks) {
  fifoQueue.length = 0;
  lifoStack.length = 0;
  tasks.forEach((t) => {
    fifoQueue.push(t);
    lifoStack.push(t);
  });
  renderDSViews();
}

function renderDSViews() {
  const fifoList = document.getElementById("fifoList");
  const lifoList = document.getElementById("lifoList");
  fifoList.innerHTML = "";
  lifoList.innerHTML = "";

  fifoQueue.forEach((t) => {
    const div = document.createElement("div");
    div.className = "task-item";
    div.innerHTML = `
      <div class="task-content">
        <div class="task-title">${t.title}</div>
        <div class="task-time">${t.time || "Anytime"}</div>
      </div>
    `;
    fifoList.appendChild(div);
  });

  [...lifoStack].reverse().forEach((t) => {
    const div = document.createElement("div");
    div.className = "task-item";
    div.innerHTML = `
      <div class="task-content">
        <div class="task-title">${t.title}</div>
        <div class="task-time">${t.time || "Anytime"}</div>
      </div>
    `;
    lifoList.appendChild(div);
  });
}
