require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const connectDB = require("./config/db");
const User = require("./models/user");

const seedUsers = [
  {
    name: "Admin User",
    email: "admin@bloodflow.local",
    number: "01710000001",
    bloodGroup: "O+",
    location: "Dhaka",
    password: "Admin@12345",
    role: "admin",
  },
  {
    name: "Donor User",
    email: "donor@bloodflow.local",
    number: "01710000002",
    bloodGroup: "A+",
    location: "Chattogram",
    password: "Donor@12345",
    role: "donor",
  },
  {
    name: "Volunteer User",
    email: "volunteer@bloodflow.local",
    number: "01710000003",
    bloodGroup: "B+",
    location: "Khulna",
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
