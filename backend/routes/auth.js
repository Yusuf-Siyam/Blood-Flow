// Auth routes: register & login
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/user");
const router = express.Router();

function createResetToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, purpose: "password-reset" },
    process.env.JWT_SECRET,
    { expiresIn: "15m" },
  );
}

function buildResetUrl(token) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  return `${frontendUrl}/reset-password?token=${token}`;
}

function createMailTransport() {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_PORT ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendResetEmail(user, resetUrl) {
  const transport = createMailTransport();

  if (!transport) {
    return false;
  }

  await transport.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: user.email,
    subject: "Blood Flow password reset",
    text: `Hello ${user.name}, reset your password here: ${resetUrl}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#2c1717">
        <h2 style="color:#9f1d1d">Blood Flow password reset</h2>
        <p>Hello ${user.name},</p>
        <p>Use the button below to reset your password. The link expires in 15 minutes.</p>
        <p><a href="${resetUrl}" style="display:inline-block;padding:12px 18px;background:#9f1d1d;color:#fff;text-decoration:none;border-radius:8px">Reset password</a></p>
        <p>If the button does not work, copy this link:</p>
        <p>${resetUrl}</p>
      </div>
    `,
  });

  return true;
}

async function findUserByEmail(email) {
  return User.findOne({ email: email.trim().toLowerCase() });
}

async function createUser(userData) {
  const user = new User({
    ...userData,
    name: userData.name.trim(),
    email: userData.email.trim().toLowerCase(),
    number: userData.number.trim(),
    bloodGroup: userData.bloodGroup.trim(),
    location: userData.location.trim(),
    role: (userData.role || "donor").trim().toLowerCase(),
  });
  await user.save();
  return user;
}

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, number, bloodGroup, location, password, role } =
      req.body;
    if (!name || !email || !number || !bloodGroup || !location || !password) {
      return res.status(400).json({
        message:
          "Name, email, number, blood group, location and password are required",
      });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }
    const normalizedRole = (role || "donor").trim().toLowerCase();
    if (!["admin", "donor", "volunteer"].includes(normalizedRole)) {
      return res.status(400).json({ message: "Invalid role selected" });
    }
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await createUser({
      name,
      email,
      number,
      bloodGroup,
      location,
      password: hashed,
      role: normalizedRole,
    });
    res.status(201).json({
      message: "User registered",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        number: user.number,
        bloodGroup: user.bloodGroup,
        location: user.location,
        role: user.role,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Registration failed", error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ message: "Invalid email" });
    const normalizedRole = (role || "").trim().toLowerCase();
    if (!normalizedRole) {
      return res.status(400).json({ message: "Role is required" });
    }
    if (user.role !== normalizedRole) {
      return res.status(401).json({ message: "Wrong password" });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Wrong password" });
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        number: user.number,
        bloodGroup: user.bloodGroup,
        location: user.location,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "Invalid email" });
    }

    const resetToken = createResetToken(user);
    const resetLink = buildResetUrl(resetToken);
    const emailSent = await sendResetEmail(user, resetLink);

    res.json({
      message: emailSent
        ? "Reset email sent"
        : "Reset link generated (email service not configured)",
      resetLink,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Password reset failed", error: err.message });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res
        .status(400)
        .json({ message: "Token and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    if (decoded.purpose !== "password-reset") {
      return res.status(400).json({ message: "Invalid reset token" });
    }

    const user = await User.findOne({ email: decoded.email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "Invalid email" });
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Password reset failed", error: err.message });
  }
});

module.exports = router;
