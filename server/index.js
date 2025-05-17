const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const storyRoutes = require("./routes/storyRoute");
// require("dotenv").config();
const app = express();
app.use(cors());
app.use(express.json());

// Route de base
app.get("/", (req, res) => res.send("API running... 🚀"));

// Routes d'authentification
app.use("/api/auth", authRoutes);

// Routes utilisateur
app.use("/api/users", userRoutes);
// Importer les routes de session
app.use("/api/users/sessions", sessionRoutes);

//Importation des routes de story
app.use('/api/stories', storyRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
