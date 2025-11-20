// scripts/liloAI.js
// Lilo chat UI + Gemini 2.0 Flash + Voice (browser-only)

const GEMINI_API_KEY = "AIzaSyD0xz5mxtUbfu-_yG9x_s5PJ6gcAFdOLQk";

export function initLilo() {
  const liloTrigger = document.querySelector(".lilo-assistant");
  const liloWindow = document.querySelector(".lilo-chat-window");
  const chatMessages = document.getElementById("chatMessages");
  const chatInput = document.getElementById("chatInput");
  const chatSendBtn = document.getElementById("chatSendBtn");
  const chatMicBtn = document.getElementById("chatMicBtn");

  // ==== VOICE: SETUP RECOGNITION ====
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  let isListening = false;

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = "en-IN"; // you can change to "en-US" if you like
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.addEventListener("result", (event) => {
      const transcript = event.results[0][0].transcript;
      chatInput.value = transcript;
      // auto-send after recognition
      handleChatSend();
    });

    recognition.addEventListener("end", () => {
      isListening = false;
      if (chatMicBtn) chatMicBtn.classList.remove("listening");
    });
  } else {
    // Browser doesn't support speech input -> hide mic button
    if (chatMicBtn) chatMicBtn.style.display = "none";
  }

  // ==== VOICE: SPEAK FUNCTION ====
  function speak(text) {
    if (!("speechSynthesis" in window)) return;
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-IN"; // or "en-US"
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Speech synthesis error:", e);
    }
  }

  // Toggle chat window
  liloTrigger.addEventListener("click", () => {
    liloWindow.classList.toggle("open");
  });

  // Append message bubble
  function appendMessage(text, who = "lilo") {
    const msg = document.createElement("div");
    msg.className = "message " + who;

    const bubble = document.createElement("div");
    bubble.className = "message-bubble";
    bubble.textContent = text;

    msg.appendChild(bubble);
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Send message + get AI reply
  async function handleChatSend() {
    const text = chatInput.value.trim();
    if (!text) return;

    appendMessage(text, "user");
    chatInput.value = "";

    // Thinking bubble
    const thinking = document.createElement("div");
    thinking.className = "message lilo";

    const bubble = document.createElement("div");
    bubble.className = "message-bubble";
    bubble.textContent = "Lilo is thinking...";

    thinking.appendChild(bubble);
    chatMessages.appendChild(thinking);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
      const reply = await callLiloAI(text);
      thinking.remove();
      appendMessage(reply, "lilo");
      speak(reply); // 🔊 Lilo talks
    } catch (e) {
      console.log("AI error:", e);
      thinking.remove();
      const errText = "Error connecting to Lilo AI.";
      appendMessage(errText, "lilo");
      speak(errText);
    }
  }

  chatSendBtn.addEventListener("click", handleChatSend);
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleChatSend();
  });

  // ==== VOICE: MIC BUTTON HANDLER ====
  if (chatMicBtn) {
    chatMicBtn.addEventListener("click", () => {
      if (!recognition) {
        alert("Voice input is not supported in this browser.");
        return;
      }
      if (!isListening) {
        isListening = true;
        chatMicBtn.classList.add("listening");
        recognition.start();
      } else {
        isListening = false;
        chatMicBtn.classList.remove("listening");
        recognition.stop();
      }
    });
  }

  // Auto welcome
  const intro =
    "Give me a simple positive productive daily schedule with wake-up, study, breaks and sleep.";
  appendMessage("Hi Lilo! " + intro, "user");

  callLiloAI(intro)
    .then((reply) => {
      appendMessage(reply, "lilo");
      speak(reply);
    })
    .catch(() => {
      const fallback =
        "Once AI is configured, I'll suggest your perfect day here! 🌞";
      appendMessage(fallback, "lilo");
      speak(fallback);
    });
}

// =======================
//     GEMINI AI CALL
// =======================

async function callLiloAI(userText) {
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  const payload = {
    contents: [
      {
        parts: [
          {
            text: `
You are Lilo — a cheerful, positive scheduling assistant.
You live inside a website called "Lilo Scheduler".
Always reply short, encouraging and helpful.

User: ${userText}
        `.trim()
          }
        ]
      }
    ]
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  console.log("GEMINI RESPONSE:", data);

  return (
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "I couldn't think of a reply now, try again!"
  );
}
