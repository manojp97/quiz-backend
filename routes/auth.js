const express = require("express");
const router = express.Router();
const fs = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const USERS_FILE = "./data/users.json";

// Helper functions
const getUsers = () => {
  try {
    const data = fs.readFileSync(USERS_FILE, "utf-8");
    return JSON.parse(data || "[]");
  } catch {
    return [];
  }
};

const saveUsers = (users) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

// SIGNUP
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ error: "All fields required" });

  const users = getUsers();
  if (users.find((u) => u.email === email))
    return res.status(400).json({ error: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { id: Date.now(), name, email, password: hashedPassword };

  users.push(newUser);
  saveUsers(users);

  res.status(201).json({ message: "User created successfully" });
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });

  const users = getUsers();
  const user = users.find((u) => u.email === email);
  if (!user) return res.status(400).json({ error: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.json({
    message: "Login successful",
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
});

module.exports = router;