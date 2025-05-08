const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
require("dotenv").config();
const app = express();
app.use(cors());
app.use(express.json());

// Route de base
app.get("/", (req, res) => res.send("API running... 🚀"));

// Routes d'authentification
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
