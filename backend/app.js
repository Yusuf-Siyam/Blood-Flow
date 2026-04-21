const express = require("express");
const cors = require("cors");
const app = express();
const authRoutes = require("./routes/auth");
const donorRoutes = require("./routes/donor");

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Morgan logging in development
if (process.env.NODE_ENV === "development") {
  const morgan = require("morgan");
  app.use(morgan("dev"));
}

// Test route
app.get("/", (req, res) => {
  res.send("Hello from Express!");
});

app.use("/api/auth", authRoutes);
app.use("/api/donor", donorRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

module.exports = app;
