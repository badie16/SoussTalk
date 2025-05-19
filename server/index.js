const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const supabase = require("./config/supabase");
const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { setupMessageSocket } = require("./sockets/messageSocket");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Routes HTTP
app.get("/", (req, res) => res.send("API running... 🚀"));
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Middleware d'authentification pour les sockets
io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error("Token requis"));
  }

  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession(token);

    if (sessionError || !sessionData.session) {
      console.error("Token invalide Supabase:", sessionError);
      return next(new Error("Token invalide"));
    }

    socket.user = sessionData.session.user;
    next();
  } catch (err) {
    console.error("Erreur validation token Supabase:", err);
    return next(new Error("Token invalide"));
  }
});

// Gestion connexion socket
io.on("connection", (socket) => {
  console.log(`✅ Utilisateur connecté: ${socket.user.id}`);

  setupMessageSocket(socket, io);

  socket.on("disconnect", () => {
    console.log(`Utilisateur déconnecté: ${socket.user.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur en ligne sur le port ${PORT}`);
});
