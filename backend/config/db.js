const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("Missing MONGODB_URI or MONGO_URI environment variable");
  }

  try {
    const hasDatabaseName = /mongodb(?:\+srv)?:\/\/[^/]+\/[^/?]+/.test(
      mongoUri,
    );
    const options = {
      serverSelectionTimeoutMS: 5000,
      ...(hasDatabaseName
        ? {}
        : { dbName: process.env.MONGODB_DB_NAME || "blood_flow" }),
    };

    await mongoose.connect(mongoUri, options);
    console.log(`✅ Connected to MongoDB (${mongoose.connection.name})`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
