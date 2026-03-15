const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("../routes/auth");
const quizRoutes = require("../routes/quiz");

app.use("/api/auth", authRoutes);
app.use("/api/quiz", quizRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// IMPORTANT: export for Vercel
module.exports = app;