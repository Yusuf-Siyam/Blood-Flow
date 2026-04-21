const express = require("express");
const authMiddleware = require("../middleware/auth");
const BloodRequest = require("../models/bloodRequest");
const User = require("../models/user");

const router = express.Router();

router.use(authMiddleware);

const statusAlias = {
  open: "active",
  fulfilled: "completed",
};

const MIN_DONATION_GAP_DAYS = 90;

function normalizeStatus(status) {
  if (!status) return "active";
  return statusAlias[status] || status;
}

function computeBadge(points) {
  if (points >= 300) return "Gold";
  if (points >= 150) return "Silver";
  return "Bronze";
}

function safeLocationValue(value) {
  return (value || "").trim();
}

async function pushNotification(userId, payload) {
  await User.updateOne(
    { _id: userId },
    {
      $push: {
        notifications: {
          $each: [
            {
              type: payload.type || "general",
              title: payload.title,
              message: payload.message,
              read: false,
              createdAt: new Date(),
              meta: payload.meta || {},
            },
          ],
          $slice: -50,
        },
      },
    },
  );
}

function canAcceptByDonationGap(lastDonationDate) {
  if (!lastDonationDate) return { allowed: true, daysRemaining: 0 };
  const now = new Date();
  const diffMs = now.getTime() - new Date(lastDonationDate).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays >= MIN_DONATION_GAP_DAYS) {
    return { allowed: true, daysRemaining: 0 };
  }
  return {
    allowed: false,
    daysRemaining: MIN_DONATION_GAP_DAYS - diffDays,
  };
}

async function notifyTopMatchingDonors(request, excludeIds = []) {
  const excluded = excludeIds.map((id) => String(id));
  const candidates = await User.find({
    role: "donor",
    availability: true,
    bloodGroup: request.bloodGroup,
    district: request.district,
    _id: { $nin: excluded },
  })
    .sort({ trustScore: -1, created_at: 1 })
    .limit(5)
    .select("_id name")
    .lean();

  await Promise.all(
    candidates.map((donor) =>
      pushNotification(donor._id, {
        type: "request-match",
        title: "New matching blood request",
        message: `${request.bloodGroup} needed at ${request.location}. Urgency: ${request.urgency}.`,
        meta: { requestId: request._id },
      }),
    ),
  );

  return candidates;
}

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

    const donorDistrict = safeLocationValue(donor.district) || donor.location;
    const donorDivision = safeLocationValue(donor.division);

    const activeStatuses = ["active", "open"];

    const nearbyRequests = donor.availability
      ? await BloodRequest.find({
          status: { $in: activeStatuses },
          requester: { $ne: donor._id },
          bloodGroup: donor.bloodGroup,
          district: donorDistrict,
        })
          .sort({ urgency: 1, createdAt: -1 })
          .limit(8)
          .lean()
      : [];

    const assignedRequests = await BloodRequest.find({
      "assignedDonor.id": donor._id,
      status: { $in: ["accepted", "in_progress", "completed", "verified"] },
    })
      .sort({ updatedAt: -1 })
      .limit(6)
      .lean();

    const allActiveRequests = await BloodRequest.find({
      status: { $in: activeStatuses },
      requester: { $ne: donor._id },
    })
      .sort({ urgency: 1, createdAt: -1 })
      .limit(20)
      .lean();

    const scoredRequests = nearbyRequests
      .map((request) => {
        let matchScore = 0;
        if (request.bloodGroup === donor.bloodGroup) matchScore += 40;
        if (safeLocationValue(request.district) === donorDistrict)
          matchScore += 30;
        if (
          donorDivision &&
          safeLocationValue(request.division) === donorDivision
        ) {
          matchScore += 10;
        }
        if (donor.availability) matchScore += 15;
        matchScore += Math.min(donor.trustScore || 0, 100) * 0.05;
        if (request.urgency === "critical") matchScore += 5;
        return {
          ...request,
          status: normalizeStatus(request.status),
          matchScore: Number(matchScore.toFixed(1)),
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    const merged = [...scoredRequests, ...assignedRequests].reduce(
      (acc, item) => {
        if (!acc.some((r) => String(r._id) === String(item._id))) {
          acc.push({
            ...item,
            status: normalizeStatus(item.status),
          });
        }
        return acc;
      },
      [],
    );

    res.json({
      donor: {
        id: donor._id,
        name: donor.name,
        number: donor.number,
        bloodGroup: donor.bloodGroup,
        division: donor.division || "",
        district: donor.district || donor.location,
        location: donor.location,
        availability: donor.availability,
        lastDonationDate: donor.lastDonationDate || null,
        trustScore: donor.trustScore || 50,
      },
      nearbyRequests: merged,
      allActiveRequests: allActiveRequests.map((item) => ({
        ...item,
        status: normalizeStatus(item.status),
      })),
      donationHistory: (donor.donationHistory || [])
        .slice()
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
      rewards: {
        points: donor.rewardPoints || 0,
        badge: computeBadge(donor.rewardPoints || 0),
        trustScore: donor.trustScore || 50,
      },
      notifications: {
        unreadCount: (donor.notifications || []).filter((item) => !item.read)
          .length,
        latest: (donor.notifications || []).slice(-5).reverse(),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load donor dashboard" });
  }
});

router.get("/profile", async (req, res) => {
  try {
    if (!ensureDonor(req, res)) return;

    const donor = await User.findById(req.user.id).lean();
    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    return res.json({
      profile: {
        name: donor.name,
        bloodGroup: donor.bloodGroup,
        number: donor.number,
        division: donor.division || "",
        district: donor.district || donor.location,
        location: donor.location,
        availability: donor.availability,
        lastDonationDate: donor.lastDonationDate || null,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load donor profile" });
  }
});

router.patch("/profile", async (req, res) => {
  try {
    if (!ensureDonor(req, res)) return;

    const allowedFields = [
      "name",
      "bloodGroup",
      "number",
      "division",
      "district",
      "location",
      "availability",
      "lastDonationDate",
    ];

    const payload = {};
    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        payload[field] = req.body[field];
      }
    }

    if (typeof payload.availability !== "undefined") {
      if (typeof payload.availability !== "boolean") {
        return res
          .status(400)
          .json({ message: "Availability must be true or false" });
      }
    }

    if (payload.lastDonationDate) {
      payload.lastDonationDate = new Date(payload.lastDonationDate);
    }

    if (payload.division || payload.district) {
      const division = safeLocationValue(payload.division);
      const district = safeLocationValue(payload.district);
      payload.location = [district, division].filter(Boolean).join(", ");
    }

    const donor = await User.findByIdAndUpdate(req.user.id, payload, {
      new: true,
    }).lean();

    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    return res.json({
      message: "Profile updated",
      profile: {
        name: donor.name,
        bloodGroup: donor.bloodGroup,
        number: donor.number,
        division: donor.division || "",
        district: donor.district || donor.location,
        location: donor.location,
        availability: donor.availability,
        lastDonationDate: donor.lastDonationDate || null,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update donor profile" });
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

    const {
      patientName,
      bloodGroup,
      unitsNeeded,
      hospital,
      division,
      district,
      location,
      urgency,
      contactPhone,
      requiredDate,
      note,
      status,
    } = req.body;

    if (
      !patientName ||
      !bloodGroup ||
      !unitsNeeded ||
      !hospital ||
      !contactPhone ||
      !requiredDate
    ) {
      return res.status(400).json({
        message:
          "Patient name, blood group, units, hospital, contact and date are required",
      });
    }

    const donor = await User.findById(req.user.id).lean();
    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    const request = await BloodRequest.create({
      requester: donor._id,
      requesterName: donor.name,
      patientName: patientName.trim(),
      bloodGroup: bloodGroup.trim(),
      division: safeLocationValue(division) || donor.division || "Unknown",
      district: safeLocationValue(district) || donor.district || donor.location,
      location:
        safeLocationValue(location) ||
        [
          safeLocationValue(district) || donor.district,
          safeLocationValue(division) || donor.division,
        ]
          .filter(Boolean)
          .join(", "),
      hospital: hospital.trim(),
      contactPhone: contactPhone.trim(),
      requiredDate: new Date(requiredDate),
      unitsNeeded: Number(unitsNeeded),
      urgency: urgency === "critical" ? "critical" : "normal",
      note: (note || "").trim(),
      status: status === "draft" ? "draft" : "active",
      lifecycleHistory: [
        {
          from: null,
          to: status === "draft" ? "draft" : "active",
          by: donor._id,
          byRole: donor.role,
          note: "Request created",
        },
      ],
    });

    if (request.status === "active") {
      const candidates = await notifyTopMatchingDonors(request, [
        donor._id,
        request.requester,
      ]);

      request.matchingMeta = {
        candidatesNotified: candidates.length,
        lastMatchedAt: new Date(),
      };
      await request.save();

      await pushNotification(donor._id, {
        type: "request-created",
        title: "Request is now active",
        message: `Your request for ${request.patientName} is active and donor matching has started.`,
        meta: { requestId: request._id },
      });
    }

    res.status(201).json({
      message:
        request.status === "draft"
          ? "Request saved as draft"
          : "Blood request activated",
      request,
    });
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

    if (action === "accept") {
      const donationGap = canAcceptByDonationGap(donor.lastDonationDate);
      if (!donationGap.allowed) {
        return res.status(400).json({
          message: `You are not eligible yet. Please wait ${donationGap.daysRemaining} more day(s) before accepting a new donation request.`,
        });
      }
    }

    const request = await BloodRequest.findById(req.params.requestId);
    const requestStatus = normalizeStatus(request?.status);

    if (!request || requestStatus !== "active") {
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
      request.status = "accepted";
      request.assignedDonor = {
        id: donor._id,
        name: donor.name,
      };
      request.lifecycleHistory = request.lifecycleHistory || [];
      request.lifecycleHistory.push({
        from: "active",
        to: "accepted",
        by: donor._id,
        byRole: donor.role,
        note: "Donor accepted request",
      });

      donor.donationHistory = donor.donationHistory || [];
      donor.donationHistory.push({
        date: new Date(),
        location: request.location,
        notes: `Accepted ${request.bloodGroup} request`,
        status: "accepted",
      });
      donor.rewardPoints = (donor.rewardPoints || 0) + 5;
      await donor.save();

      await pushNotification(request.requester, {
        type: "request-accepted",
        title: "Your request was accepted",
        message: `${donor.name} accepted the request for ${request.patientName}.`,
        meta: { requestId: request._id },
      });

      const volunteers = await User.find({ role: "volunteer" })
        .select("_id")
        .limit(12)
        .lean();

      await Promise.all(
        volunteers.map((volunteer) =>
          pushNotification(volunteer._id, {
            type: "verification-needed",
            title: "Donation requires follow-up",
            message: `A donation request is accepted and may need verification soon (${request.patientName}).`,
            meta: { requestId: request._id },
          }),
        ),
      );
    }

    if (action === "decline") {
      const respondedIds = (request.responders || []).map((item) => item.user);
      const nextCandidates = await notifyTopMatchingDonors(request, [
        ...respondedIds,
        donor._id,
        request.requester,
      ]);

      request.matchingMeta = {
        ...(request.matchingMeta || {}),
        candidatesNotified: nextCandidates.length,
        lastMatchedAt: new Date(),
      };
      await request.save();
    }

    await request.save();

    res.json({
      message: action === "accept" ? "Request accepted" : "Request declined",
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to respond to request" });
  }
});

router.patch("/requests/:requestId/status", async (req, res) => {
  try {
    const { nextStatus, note } = req.body;
    if (!nextStatus) {
      return res.status(400).json({ message: "nextStatus is required" });
    }

    const request = await BloodRequest.findById(req.params.requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    const currentStatus = normalizeStatus(request.status);
    const actorRole = req.user.role;
    const isAssignedDonor =
      String(request.assignedDonor?.id || "") === String(req.user.id);
    const isRequester = String(request.requester) === String(req.user.id);

    let allowed = false;

    if (
      actorRole === "donor" &&
      isAssignedDonor &&
      currentStatus === "accepted" &&
      nextStatus === "in_progress"
    ) {
      allowed = true;
    }

    if (
      actorRole === "donor" &&
      isAssignedDonor &&
      currentStatus === "in_progress" &&
      nextStatus === "completed"
    ) {
      allowed = true;
    }

    if (
      ["volunteer", "admin"].includes(actorRole) &&
      currentStatus === "completed" &&
      nextStatus === "verified"
    ) {
      allowed = true;
      request.assignedVolunteer = {
        id: req.user.id,
        name: req.user.email,
      };
    }

    if (
      (isRequester || actorRole === "admin") &&
      currentStatus === "verified" &&
      nextStatus === "closed"
    ) {
      allowed = true;
    }

    if (
      (isRequester || actorRole === "admin") &&
      currentStatus === "draft" &&
      nextStatus === "active"
    ) {
      allowed = true;
    }

    if (!allowed) {
      return res.status(403).json({
        message: `Transition ${currentStatus} -> ${nextStatus} is not allowed`,
      });
    }

    request.status = nextStatus;
    request.lifecycleHistory = request.lifecycleHistory || [];
    request.lifecycleHistory.push({
      from: currentStatus,
      to: nextStatus,
      by: req.user.id,
      byRole: actorRole,
      note: (note || "").trim(),
    });
    await request.save();

    if (actorRole === "donor" && nextStatus === "completed") {
      const donor = await User.findById(req.user.id);
      if (donor) {
        donor.donationHistory = donor.donationHistory || [];
        donor.donationHistory.unshift({
          date: new Date(),
          location: request.location,
          notes: `Completed donation for ${request.patientName}`,
          status: "completed",
        });
        donor.lastDonationDate = new Date();
        donor.rewardPoints = (donor.rewardPoints || 0) + 50;
        donor.trustScore = Math.min((donor.trustScore || 50) + 5, 100);
        await donor.save();
      }
    }

    if (nextStatus === "verified" && request.assignedDonor?.id) {
      const donor = await User.findById(request.assignedDonor.id);
      if (donor) {
        donor.rewardPoints = (donor.rewardPoints || 0) + 20;
        donor.trustScore = Math.min((donor.trustScore || 50) + 8, 100);
        donor.badges = donor.badges || [];
        const badge = computeBadge(donor.rewardPoints);
        if (!donor.badges.includes(badge)) {
          donor.badges.push(badge);
        }
        if (!donor.badges.includes("Verified")) {
          donor.badges.push("Verified");
        }
        await donor.save();
      }

      await pushNotification(request.requester, {
        type: "request-verified",
        title: "Donation verified",
        message: `The donation for ${request.patientName} has been verified by a volunteer/admin.`,
        meta: { requestId: request._id },
      });
    }

    if (nextStatus === "closed") {
      await pushNotification(request.requester, {
        type: "request-closed",
        title: "Request closed",
        message: `The blood request for ${request.patientName} is now closed.`,
        meta: { requestId: request._id },
      });
    }

    return res.json({
      message: `Request moved to ${nextStatus}`,
      status: nextStatus,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update request status" });
  }
});

module.exports = router;
