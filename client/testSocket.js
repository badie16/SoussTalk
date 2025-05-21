// TestSocket.js (ESM compatible)
import { io } from "socket.io-client";

// Remplace ce token par un vrai JWT Supabase valide
const socket = io("http://localhost:5000", {
  auth: {
    token: "<TON_JWT_SUPABASE>"
  }
});

socket.on("connect", () => {
  console.log("✅ Connecté au serveur Socket.io");

  socket.emit("send_message", {
    conversation_id: "1",
    content: "Message test depuis le terminal",
    file_url: null,
    emotion_label: "neutral"
  });
});

socket.on("receive_message", (msg) => {
  console.log("📥 Message reçu :", msg);
});

socket.on("connect_error", (err) => {
  console.error("❌ Erreur de connexion :", err.message);
});
