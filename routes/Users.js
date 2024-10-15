const express = require("express");
const router = express.Router();
const { Users, Messages } = require("../models");
const bcrypt = require("bcryptjs");
const { validateToken } = require("../middleware/AuthMiddleware");
const { sign } = require("jsonwebtoken");

// User creation endpoint with error handling
router.post("/", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    
    await Users.create({
      username: username,
      password: hash,
    });

    res.json({ success: "User created successfully" });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      // Handle unique constraint violation error
      res.json({ error: 'Username must be unique.' });
    } else {
      console.error("Error creating user:", error);
      res.json({ error: "Failed to create user" });
    }
  }
});

// Login endpoint with error handling
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await Users.findOne({ where: { username: username } });
    if (!user) return res.json({ error: "User doesn't exist" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.json({ error: "Wrong password" });

    const accessToken = sign(
      { username: user.username, id: user.id },
      "chweNXZ1234"
    );
    res.json({ token: accessToken, username: username, id: user.id });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Endpoint to get authenticated user information
router.get("/auth", validateToken, (req, res) => {
  res.json(req.user);
});

// Endpoint to get basic user information by ID
router.get("/basicinfo/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const basicInfo = await Users.findByPk(id, {
      attributes: { exclude: ["password"] },
    });
    res.json(basicInfo);
  } catch (error) {
    console.error("Error fetching basic user info:", error);
    res.status(500).json({ error: "Failed to fetch user info" });
  }
});

// Endpoint to change user password
router.put("/changepassword", validateToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await Users.findOne({
      where: { username: req.user.username },
    });
    if (!user) return res.json({ error: "User not found" });

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) return res.json({ error: "Wrong password combination" });

    const hash = await bcrypt.hash(newPassword, 10);
    await Users.update({ password: hash }, { where: { username: req.user.username } });
    res.json({ success: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ error: "Failed to update password" });
  }
});

// Send message endpoint
router.post("/sendmessage", validateToken, async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    
    // Get sender's ID from the token
    const senderId = req.user.id;

    // Check if the receiver exists
    const receiver = await Users.findByPk(receiverId);
    if (!receiver) return res.json({ error: "Receiver not found" });

    // Save the message to the database
    await Messages.create({ senderId, receiverId, message });

    res.json({ success: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Get received messages endpoint
router.get("/receivedmessages", validateToken, async (req, res) => {
  try {
    // Get the ID of the authenticated user
    const receiverId = req.user.id;

    // Retrieve received messages for the authenticated user
    const receivedMessages = await Messages.findAll({
      where: { receiverId },
      include: { model: Users, as: 'sender', attributes: ['id', 'username'] },
    });

    res.json(receivedMessages);
  } catch (error) {
    console.error("Error fetching received messages:", error);
    res.status(500).json({ error: "Failed to fetch received messages" });
  }
});

// Get sent messages endpoint
router.get("/sentmessages", validateToken, async (req, res) => {
  try {
    // Get the ID of the authenticated user
    const senderId = req.user.id;

    // Retrieve sent messages by the authenticated user
    const sentMessages = await Messages.findAll({
      where: { senderId },
      include: { model: Users, as: 'receiver', attributes: ['id', 'username'] },
    });

    res.json(sentMessages);
  } catch (error) {
    console.error("Error fetching sent messages:", error);
    res.status(500).json({ error: "Failed to fetch sent messages" });
  }
});

module.exports = router;
