# Lilo Scheduler

Single-page web app with:

- Firebase Auth (email/password)
- Firestore with user-based collections:
  - users/{uid}/tasks
  - users/{uid}/alarms
- LIFO/FIFO data-structure visualisation for tasks
- Alarm scheduling with sound (assets/alarm.mp3)
- Lilo AI assistant (Gemini API) for suggestions and Q&A

## Setup

1. Serve this folder with a static server (VS Code Live Server, Firebase Hosting, etc.).
2. In `scripts/main.js`, replace `YOUR_GEMINI_API_KEY_HERE` with your real Gemini API key (or leave as-is to disable AI).
3. Enable Email/Password auth and Firestore in your Firebase project.

Then open `index.html` in the browser via HTTP and enjoy Lilo Scheduler.
