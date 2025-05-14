const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes"); // ✅ correct

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes); // ✅ tu peux tester POST http://localhost:5000/api/auth/login

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));