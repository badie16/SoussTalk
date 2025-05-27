const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const path = require("path");
const supabase = require("./config/supabase");

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const friendRoutes = require("./routes/friendRoutes");
const storyRoutes = require("./routes/storyRoute");
const sessionRoutes = require("./routes/sessionRoutes");
const messageRoutes = require("./routes/messageRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

// Import socket handlers
const { setupMessageSocket } = require("./sockets/messageSocket");

const app = express();
const server = http.createServer(app);

const corsOptions = {
	origin: (origin, callback) => {
		// Allow requests with no origin (mobile apps, Postman, etc.)
		if (!origin) return callback(null, true);

		const allowedOrigins = [
			"http://localhost:3000",
			"http://localhost:5173",
			"http://localhost:4173",
			"https://sousstalk.vercel.app",
			"https://sousstalk-client.vercel.app",
			process.env.CLIENT_URL,
		].filter(Boolean);

		if (allowedOrigins.includes(origin)) {
			callback(null, true);
		} else {
			console.log("CORS blocked origin:", origin);
			callback(new Error("Not allowed by CORS"));
		}
	},
	credentials: true,
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
	allowedHeaders: [
		"Origin",
		"X-Requested-With",
		"Content-Type",
		"Accept",
		"Authorization",
		"Cache-Control",
		"X-Access-Token",
	],
	exposedHeaders: ["set-cookie"],
	maxAge: 86400, // 24 hours
};
app.use(cors(corsOptions));

// Handle preflight requests
// app.options("*", cors(corsOptions));
// Configuration CORS pour Socket.io
const io = socketIo(server, {
	cors: corsOptions,
	transports: ["websocket", "polling"],
	allowEIO3: true,
	pingTimeout: 60000,
	pingInterval: 25000,
});



app.use(express.json());
app.use(express.urlencoded({ extended: true}));

// Servir les fichiers statiques
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Middleware pour Socket.io
app.use((req, res, next) => {
	req.io = io;
	next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/users/sessions", sessionRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);

// Socket.io authentication middleware - CORRIGÉ
io.use(async (socket, next) => {
	try {
		const token = socket.handshake.auth.token;
		if (!token) {
			return next(new Error("Authentication error: No token provided"));
		}

		// Vérifier le token JWT
		const decoded = jwt.verify(
			token,
			process.env.JWT_SECRET || "votre_secret_par_defaut"
		);

		// Récupérer l'utilisateur depuis la base de données
		const { data: user, error } = await supabase
			.from("users")
			.select("*")
			.eq("id", decoded.id || decoded.userId)
			.single();

		if (error || !user) {
			console.error("User not found:", error);
			return next(new Error("Authentication error: User not found"));
		}

		socket.user = user;
		next();
	} catch (error) {
		console.error("Socket authentication error:", error);
		next(new Error("Authentication error: Invalid token"));
	}
});

// Socket.io connection handling
io.on("connection", (socket) => {
	console.log(`User ${socket.user.username} connected`);

	// Rejoindre une room personnelle pour les notifications
	socket.join(`user_${socket.user.id}`);

	// Setup message socket handlers
	setupMessageSocket(socket, io);

	// Update user online status
	supabase
		.from("users")
		.update({ is_online: true, last_seen: new Date().toISOString() })
		.eq("id", socket.user.id)
		.then(() => {
			// Notify contacts about online status
			socket.broadcast.emit("user_status_changed", {
				userId: socket.user.id,
				isOnline: true,
			});
		});

	socket.on("disconnect", () => {
		console.log(`User ${socket.user.username} disconnected`);

		// Update user offline status
		supabase
			.from("users")
			.update({ is_online: false, last_seen: new Date().toISOString() })
			.eq("id", socket.user.id)
			.then(() => {
				// Notify contacts about offline status
				socket.broadcast.emit("user_status_changed", {
					userId: socket.user.id,
					isOnline: false,
				});
			});
	});
});

// Health check
app.get("/", (req, res) => {
	res.json({ message: "SoussTalk API is running!" });
});
app.get("/health", (req, res) => {
	res.status(200).json({
		status: "OK",
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
	});
});
// Error handling middleware
app.use((error, req, res, next) => {
	console.error("Error:", error);
	res.status(500).json({ error: "Internal server error" });
});



const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io };
