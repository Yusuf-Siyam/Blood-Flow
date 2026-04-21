const mongoose = require("mongoose");

const bloodRequestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requesterName: { type: String, required: true, trim: true },
    patientName: { type: String, required: true, trim: true },
    bloodGroup: { type: String, required: true, trim: true },
    division: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    hospital: { type: String, required: true, trim: true },
    contactPhone: { type: String, required: true, trim: true },
    requiredDate: { type: Date, required: true },
    unitsNeeded: { type: Number, required: true, min: 1, max: 10 },
    urgency: {
      type: String,
      enum: ["critical", "normal"],
      default: "normal",
    },
    note: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: [
        "draft",
        "active",
        "accepted",
        "in_progress",
        "completed",
        "verified",
        "closed",
        "open",
        "fulfilled",
      ],
      default: "active",
    },
    assignedDonor: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name: { type: String, trim: true },
    },
    assignedVolunteer: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name: { type: String, trim: true },
    },
    lifecycleHistory: [
      {
        from: { type: String, trim: true },
        to: { type: String, required: true, trim: true },
        by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        byRole: { type: String, trim: true },
        note: { type: String, trim: true, default: "" },
        at: { type: Date, default: Date.now },
      },
    ],
    matchingMeta: {
      candidatesNotified: { type: Number, default: 0 },
      lastMatchedAt: { type: Date },
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
