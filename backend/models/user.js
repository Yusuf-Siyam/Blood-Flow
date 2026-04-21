// User model for authentication (MongoDB)
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  number: { type: String, required: true, trim: true },
  bloodGroup: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  availability: { type: Boolean, default: true },
  donationHistory: [
    {
      date: { type: Date, default: Date.now },
      location: { type: String, required: true, trim: true },
      notes: { type: String, default: "" },
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
