// scripts/main.js
// Entry point: wires all modules together

import { initAuth } from "./auth.js";
import { initTasks } from "./tasks.js";
import { initAlarms } from "./alarms.js";
import { initUI } from "./ui.js";
import { initLilo } from "./liloAI.js";

window.addEventListener("load", () => {
  initAuth();
  initTasks();
  initAlarms();
  initUI();
  initLilo();
});
