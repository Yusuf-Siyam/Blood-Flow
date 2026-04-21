const mongoose = require("mongoose");

const bloodRequestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requesterName: { type: String, required: true, trim: true },
    bloodGroup: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    unitsNeeded: { type: Number, required: true, min: 1, max: 10 },
    urgency: {
      type: String,
      enum: ["critical", "normal"],
      default: "normal",
    },
    note: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["open", "fulfilled", "closed"],
      default: "open",
    },
    responders: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        name: { type: String, required: true, trim: true },
        action: {
          type: String,
          enum: ["accepted", "declined"],
          required: true,
        },
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("BloodRequest", bloodRequestSchema);
