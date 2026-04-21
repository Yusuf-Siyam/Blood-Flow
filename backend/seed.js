require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const connectDB = require("./config/db");
const User = require("./models/user");

const seedUsers = [
  {
    name: "Admin Siyam 1011",
    email: "adminsiyam1011@gmail.com",
    number: "01710000001",
    bloodGroup: "O+",
    location: "Dhaka",
    availability: false,
    donationHistory: [],
    password: "siyam1011",
    role: "admin",
  },
  {
    name: "Admin Siyam 2021",
    email: "adminsiyam2021@gmail.com",
    number: "01710000004",
    bloodGroup: "A+",
    location: "Dhaka",
    availability: false,
    donationHistory: [],
    password: "siyam2021",
    role: "admin",
  },
  {
    name: "Donor User",
    email: "donor@bloodflow.local",
    number: "01710000002",
    bloodGroup: "A+",
    location: "Chattogram",
    availability: true,
    donationHistory: [
      {
        date: new Date("2026-03-12"),
        location: "Chattogram Medical",
        notes: "Regular donation",
      },
      {
        date: new Date("2026-01-20"),
        location: "Agrabad Blood Camp",
        notes: "Emergency response",
      },
    ],
    password: "Donor@12345",
    role: "donor",
  },
  {
    name: "Volunteer User",
    email: "volunteer@bloodflow.local",
    number: "01710000003",
    bloodGroup: "B+",
    location: "Khulna",
    availability: false,
    donationHistory: [],
    password: "Volunteer@12345",
    role: "volunteer",
  },
];

async function seedDatabase() {
  await connectDB();

  let processedUsers = 0;

  for (const seedUser of seedUsers) {
    const hashedPassword = await bcrypt.hash(seedUser.password, 10);

    await User.updateOne(
      { email: seedUser.email.toLowerCase() },
      {
        $set: {
          name: seedUser.name,
          number: seedUser.number,
          bloodGroup: seedUser.bloodGroup,
          location: seedUser.location,
          availability: seedUser.availability,
          donationHistory: seedUser.donationHistory,
          password: hashedPassword,
          role: seedUser.role,
        },
        $setOnInsert: {
          email: seedUser.email.toLowerCase(),
        },
      },
      { upsert: true },
    );

    processedUsers += 1;
    console.log(`Seeded: ${seedUser.email} (${seedUser.role})`);
  }

  const totalUsers = await User.countDocuments();
  console.log(`Seed complete. Processed ${processedUsers} users.`);
  console.log(`Total users in database: ${totalUsers}`);
}

seedDatabase()
  .catch((error) => {
    console.error("❌ Seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
