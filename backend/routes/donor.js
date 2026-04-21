const express = require("express");
const authMiddleware = require("../middleware/auth");
const BloodRequest = require("../models/bloodRequest");
const User = require("../models/user");

const router = express.Router();

router.use(authMiddleware);

function ensureDonor(req, res) {
  if (req.user.role !== "donor") {
    res.status(403).json({ message: "Donor access only" });
    return false;
  }
  return true;
}

router.get("/dashboard", async (req, res) => {
  try {
    if (!ensureDonor(req, res)) return;

    const donor = await User.findById(req.user.id).lean();
    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    const nearbyRequests = await BloodRequest.find({
      status: "open",
      location: donor.location,
      requester: { $ne: donor._id },
    })
      .sort({ urgency: 1, createdAt: -1 })
      .limit(8)
      .lean();

    const urgentRequests = await BloodRequest.find({
      status: "open",
      requester: { $ne: donor._id },
      urgency: "critical",
    })
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();

    const merged = [...nearbyRequests, ...urgentRequests].reduce(
      (acc, item) => {
        if (!acc.some((r) => String(r._id) === String(item._id))) {
          acc.push(item);
        }
        return acc;
      },
      [],
    );

    res.json({
      donor: {
        id: donor._id,
        name: donor.name,
        bloodGroup: donor.bloodGroup,
        location: donor.location,
        availability: donor.availability,
      },
      nearbyRequests: merged,
      donationHistory: (donor.donationHistory || [])
        .slice()
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load donor dashboard" });
  }
});

router.patch("/availability", async (req, res) => {
  try {
    if (!ensureDonor(req, res)) return;

    const { availability } = req.body;
    if (typeof availability !== "boolean") {
      return res
        .status(400)
        .json({ message: "Availability must be true or false" });
    }

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { availability },
      { new: true },
    ).lean();

    res.json({ availability: updated.availability });
  } catch (error) {
    res.status(500).json({ message: "Failed to update availability" });
  }
});

router.post("/request-blood", async (req, res) => {
  try {
    if (!ensureDonor(req, res)) return;

    const { bloodGroup, location, unitsNeeded, urgency, note } = req.body;
    if (!bloodGroup || !location || !unitsNeeded) {
      return res
        .status(400)
        .json({ message: "Blood group, location and units are required" });
    }

    const donor = await User.findById(req.user.id).lean();
    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    const request = await BloodRequest.create({
      requester: donor._id,
      requesterName: donor.name,
      bloodGroup: bloodGroup.trim(),
      location: location.trim(),
      unitsNeeded: Number(unitsNeeded),
      urgency: urgency === "critical" ? "critical" : "normal",
      note: (note || "").trim(),
    });

    res.status(201).json({ message: "Blood request posted", request });
  } catch (error) {
    res.status(500).json({ message: "Failed to create blood request" });
  }
});

router.post("/respond/:requestId", async (req, res) => {
  try {
    if (!ensureDonor(req, res)) return;

    const { action } = req.body;
    if (!["accept", "decline"].includes(action)) {
      return res
        .status(400)
        .json({ message: "Action must be accept or decline" });
    }

    const donor = await User.findById(req.user.id);
    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    const request = await BloodRequest.findById(req.params.requestId);
    if (!request || request.status !== "open") {
      return res.status(404).json({ message: "Request not available" });
    }

    if (String(request.requester) === String(donor._id)) {
      return res
        .status(400)
        .json({ message: "You cannot respond to your own request" });
    }

    request.responders = (request.responders || []).filter(
      (entry) => String(entry.user) !== String(donor._id),
    );
    request.responders.push({
      user: donor._id,
      name: donor.name,
      action: action === "accept" ? "accepted" : "declined",
      at: new Date(),
    });

    if (action === "accept") {
      donor.donationHistory = donor.donationHistory || [];
      donor.donationHistory.push({
        date: new Date(),
        location: request.location,
        notes: `Responded to ${request.bloodGroup} request`,
      });
      await donor.save();
    }

    await request.save();

    res.json({
      message: action === "accept" ? "Request accepted" : "Request declined",
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to respond to request" });
  }
});

module.exports = router;
