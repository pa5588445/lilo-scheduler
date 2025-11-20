// scripts/ui.js
// UI helpers: calendar, chart, navigation, avatar, etc.

export function initUI() {
  // Draw calendar + chart
  generateCalendar();
  initChart();

  // Sidebar navigation
  initSidebarNav();

  // Avatar -> go to settings section
  const avatar = document.getElementById("userAvatar");
  if (avatar) {
    avatar.addEventListener("click", () => {
      scrollToSection("#settings-section");
    });
  }
}

/* ---------- NAVIGATION ---------- */

function initSidebarNav() {
  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      // active style
      navItems.forEach((i) => i.classList.remove("active"));
      item.classList.add("active");

      const label = item.innerText.trim().toLowerCase();

      if (label === "dashboard") {
        // top of page
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (label === "calendar") {
        scrollToSection("#calendar-section");
      } else if (label === "tasks") {
        scrollToSection("#tasks-section");
      } else if (label === "alarms") {
        scrollToSection("#alarms-section");
      } else if (label === "settings") {
        scrollToSection("#settings-section");
      }
    });
  });
}

function scrollToSection(selector) {
  const el = document.querySelector(selector);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 70;
  window.scrollTo({ top: y, behavior: "smooth" });
}

/* ---------- CALENDAR ---------- */

function generateCalendar() {
  const calendarEl = document.querySelector(".calendar");
  if (!calendarEl) return;

  // remove old days (keep weekday header = first 7 children)
  while (calendarEl.childNodes.length > 7) {
    calendarEl.removeChild(calendarEl.lastChild);
  }

  // Demo: June 2023
  const daysInMonth = 30;
  const startDay = 4; // Thu

  // empty slots before 1st
  for (let i = 0; i < startDay; i++) {
    const emptyDay = document.createElement("div");
    emptyDay.className = "calendar-day";
    calendarEl.appendChild(emptyDay);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const day = document.createElement("div");
    day.className = "calendar-day";
    if (i === 15) day.classList.add("active");
    if (i % 5 === 0 || i % 7 === 0) day.classList.add("has-events");
    day.textContent = i;
    calendarEl.appendChild(day);
  }
}

/* ---------- CHART ---------- */

function initChart() {
  const canvas = document.getElementById("alarmChart");
  if (!canvas || !window.Chart) return;

  const ctx = canvas.getContext("2d");

  new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          label: "Alarm Completions",
          data: [12, 19, 14, 15, 16, 12, 10],
          borderColor: "#0B6EFD",
          tension: 0.3,
          fill: true,
          backgroundColor: "rgba(11, 110, 253, 0.1)",
        },
      ],
    },
    options: {
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { drawBorder: false },
        },
        x: {
          grid: { display: false },
        },
      },
    },
  });
}
