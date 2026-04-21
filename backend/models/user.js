// User model for authentication (MongoDB)
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  number: { type: String, required: true, trim: true },
  bloodGroup: { type: String, required: true, trim: true },
  division: { type: String, default: "", trim: true },
  district: { type: String, default: "", trim: true },
  location: { type: String, required: true, trim: true },
  lastDonationDate: { type: Date },
  availability: { type: Boolean, default: true },
  rewardPoints: { type: Number, default: 0, min: 0 },
  badges: [{ type: String, trim: true }],
  trustScore: { type: Number, default: 50, min: 0, max: 100 },
  notifications: [
    {
      type: { type: String, trim: true, default: "general" },
      title: { type: String, trim: true, required: true },
      message: { type: String, trim: true, required: true },
      read: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
      meta: {
        requestId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "BloodRequest",
        },
      },
    },
  ],
  donationHistory: [
    {
      date: { type: Date, default: Date.now },
      location: { type: String, required: true, trim: true },
      notes: { type: String, default: "" },
      status: {
        type: String,
        enum: ["accepted", "in_progress", "completed", "verified"],
        default: "accepted",
      },
    },
  ],
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "donor", "volunteer"],
    default: "donor",
  },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
