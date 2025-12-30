import express from "express";
import mongoose from "mongoose";  // ✅ ADDED: For ObjectId check
import GuideProfile from "../models/guideprofile.js";
import GuideHire from "../models/GuideHire.js";
import User from "../models/User.js";

const router = express.Router();

/* ================= PROFILE ================= */
router.get("/profile", async (req, res) => {
  try {
    const profile = await GuideProfile.findOne({ email: req.query.email });
    res.json(profile || {});
  } catch (err) {  // ✅ FIXED: Added error param
    console.error("Profile fetch error:", err);
    res.status(500).json({ message: "Profile fetch failed" });
  }
});

router.patch("/profile/update", async (req, res) => {
  try {
    const { email, profile } = req.body;
    const updated = await GuideProfile.findOneAndUpdate(
      { email },
      profile,
      { upsert: true, new: true }
    );
    res.json({ profile: updated });
  } catch (err) {  // ✅ FIXED: Added error param
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Profile update failed" });
  }
});

/* ================= APPROVAL STATUS ================= */
router.get("/approval-status", async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.query.email,
      role: "Local Guide",
    });
    if (!user) return res.json({ isApproved: false });
    res.json({ isApproved: user.approved === true });
  } catch (err) {  // ✅ FIXED: Added error param
    console.error("Approval status error:", err);
    res.status(500).json({ message: "Approval status failed" });
  }
});

/* ================= AVAILABILITY ================= */
router.post("/availability/add", async (req, res) => {
  try {
    const { email, date, morning, evening } = req.body;
    const profile = await GuideProfile.findOneAndUpdate(
      { email },
      { $push: { availability: { date, morning, evening } } },
      { upsert: true, new: true }
    );
    res.json(profile);
  } catch (err) {  // ✅ FIXED: Added error param
    console.error("Availability update error:", err);
    res.status(500).json({ message: "Availability update failed" });
  }
});

/* ================= HIRE REQUESTS ================= */
router.get("/hire-requests", async (req, res) => {
  try {
    const hires = await GuideHire.find({ guideEmail: req.query.email });
    res.json(hires);
  } catch (err) {  // ✅ FIXED: Added error param
    console.error("Hire requests error:", err);
    res.status(500).json({ message: "Hire requests failed" });
  }
});

router.patch("/hire-requests/:id/status", async (req, res) => {
  try {
    const hire = await GuideHire.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!hire) {
      return res.status(404).json({ message: "Hire request not found" });
    }
    res.json({ hire });
  } catch (err) {  // ✅ FIXED: Added error param
    console.error("Hire update error:", err);
    res.status(500).json({ message: "Hire update failed" });
  }
});

/* ================= PORTFOLIO ================= */
router.get("/portfolio", async (req, res) => {
  try {
    const profile = await GuideProfile.findOne({ email: req.query.email });
    res.json(profile?.portfolio || []);
  } catch (err) {  // ✅ FIXED: Added error param
    console.error("Portfolio fetch error:", err);
    res.status(500).json({ message: "Portfolio fetch failed" });
  }
});

router.post("/portfolio/add", async (req, res) => {
  try {
    const { email, title, description, image } = req.body;
    const profile = await GuideProfile.findOneAndUpdate(
      { email },
      { $push: { portfolio: { title, description, image } } },
      { upsert: true, new: true }
    );
    res.json({ portfolio: profile.portfolio });
  } catch (err) {  // ✅ FIXED: Added error param
    console.error("Portfolio add error:", err);
    res.status(500).json({ message: "Portfolio add failed" });
  }
});

/* ================= 🔥 FIXED HIRE LOCAL GUIDE ================= */
router.post("/hire-guide", async (req, res) => {
  try {
    const { guideId, touristEmail, touristName, message } = req.body;
    
    console.log("HIRE REQUEST:", { guideId, touristEmail, touristName });

    if (!guideId || !touristEmail) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ FIXED: Handle BOTH Mongo _id AND email
    let guide;
    if (mongoose.Types.ObjectId.isValid(guideId)) {
      // guideId is MongoDB _id (from public/guides)
      guide = await User.findOne({ 
        _id: guideId,
        role: "Local Guide",
        approved: true
      });
    } else {
      // guideId is email (fallback)
      guide = await User.findOne({ 
        email: guideId,
        role: "Local Guide",
        approved: true
      });
    }

    console.log("FOUND GUIDE:", guide ? guide.email : "NOT FOUND");

    if (!guide) {
      return res.status(404).json({ 
        message: "Guide not found or not approved yet" 
      });
    }

    const hire = await GuideHire.create({
      guideEmail: guide.email,
      touristEmail,
      touristName,
      message,
      status: "Pending",
    });

    console.log("HIRE CREATED:", hire._id);
    res.status(201).json(hire);
  } catch (err) {  // ✅ FIXED: Proper error handling
    console.error("Hire guide error:", err);
    res.status(500).json({ message: "Failed to send hire request" });
  }
});

export default router;
