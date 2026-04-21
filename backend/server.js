require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const bcrypt = require("bcryptjs");
const User = require("./models/user");

const PORT = process.env.PORT || 5000;

const adminAccounts = [
  {
    name: "Admin Siyam 1011",
    email: "adminsiyam1011@gmail.com",
    number: "01710000001",
    bloodGroup: "O+",
    location: "Dhaka",
    password: "siyam1011",
    role: "admin",
  },
  {
    name: "Admin Siyam 2021",
    email: "adminsiyam2021@gmail.com",
    number: "01710000004",
    bloodGroup: "A+",
    location: "Dhaka",
    password: "siyam2021",
    role: "admin",
  },
];

async function ensureAdminAccounts() {
  for (const account of adminAccounts) {
    const hashedPassword = await bcrypt.hash(account.password, 10);

    await User.updateOne(
      { email: account.email.toLowerCase() },
      {
        $set: {
          name: account.name,
          number: account.number,
          bloodGroup: account.bloodGroup,
          location: account.location,
          availability: false,
          donationHistory: [],
          password: hashedPassword,
          role: account.role,
        },
        $setOnInsert: {
          email: account.email.toLowerCase(),
        },
      },
      { upsert: true },
    );
  }
}

async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();
    await ensureAdminAccounts();

    // Start server
    app.listen(PORT, () => {
      console.log(
        `🚀 Backend server running in ${process.env.NODE_ENV} mode on port ${PORT}`,
      );
    });
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error.message);
    process.exit(1);
  }
}

startServer();
