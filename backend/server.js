// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./src/config/db");   // <--- your DB connector
const authRoutes = require("./src/routes/auth.routes");
const apiRoutes = require("./src/routes/api.routes");

const app = express();

// Load environment variables
const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

// Middleware
app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(express.json({ limit: "10mb" }));

// Basic route to test server
app.get("/", (req, res) => {
  res.json({ message: "SpeakSign Backend is running" });
});

// API Routes
app.use("/auth", authRoutes);
app.use("/api", apiRoutes);

// Start function (connect DB THEN run server)
const startServer = async () => {
  try {
    await connectDB(); // Connect to MongoDB first
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup error:", error);
    process.exit(1);
  }
};

startServer();
