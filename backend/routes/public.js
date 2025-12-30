import express from "express";
import Homestay from "../models/Homestay.js";
import Attraction from "../models/Attraction.js";
import User from "../models/User.js";
import GuideProfile from "../models/guideprofile.js";

const router = express.Router();

/* ===================== HOMESTAYS ===================== */
router.get("/homestays", async (req, res) => {
  try {
    const homestays = await Homestay.find({
      approved: true,
      isDeleted: false, // ✅ FILTER DELETED
    });
    res.json(homestays);
  } catch (err) {
    res.status(500).json({ message: "Failed to load homestays" });
  }
});

router.get("/homestays/:id", async (req, res) => {
  try {
    const homestay = await Homestay.findById(req.params.id);

    if (!homestay || !homestay.approved || homestay.isDeleted) {
      return res.status(404).json({ message: "Homestay not found" });
    }

    res.json(homestay);
  } catch (err) {
    res.status(404).json({ message: "Homestay not found" });
  }
});

/* ===================== ATTRACTIONS ===================== */
router.get("/attractions", async (req, res) => {
  try {
    const attractions = await Attraction.find();
    res.json(attractions);
  } catch (err) {
    res.status(500).json({ message: "Failed to load attractions" });
  }
});

/* ===================== LOCAL GUIDES ===================== */
router.get("/guides", async (req, res) => {
  try {
    const guides = await User.find({
      role: "Local Guide",
      approved: true,
    }).select("-password");

    const guidesWithProfiles = await Promise.all(
      guides.map(async (user) => {
        const profile = await GuideProfile.findOne({ email: user.email });
        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage || profile?.profileImage,
          mobile: user.mobile,
          location: profile?.location || user.address,
          languages: profile?.languages || [],
          expertise: profile?.expertise || [],
          basePrice: profile?.basePrice || 0,
          bio: profile?.bio || "",
          rating: 4.5,
          approved: user.approved,
        };
      })
    );

    res.json(guidesWithProfiles);
  } catch (err) {
    res.status(500).json({ message: "Failed to load guides" });
  }
});

export default router;
