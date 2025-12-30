import express from "express";
import User from "../models/User.js";
import Homestay from "../models/Homestay.js";
import Attraction from "../models/Attraction.js";
import Booking from "../models/Booking.js";

const router = express.Router();

/* ================= EXISTING CODE (UNCHANGED) ================= */

// Get all users
router.get("/users", async (_, res) => {
  const users = await User.find();
  const map = {};
  users.forEach((u) => (map[u.email] = u));
  res.json(map);
});

// Get all homestays
router.get("/homestays", async (_, res) => {
  res.json(await Homestay.find());
});

// Approve homestay
router.patch("/homestays/approve/:id", async (req, res) => {
  await Homestay.findByIdAndUpdate(req.params.id, { approved: true });
  res.json({ message: "Homestay approved" });
});

// Get all bookings
router.get("/bookings", async (_, res) => {
  res.json(await Booking.find());
});

/* ================= NEW FEATURES (UNCHANGED - YOUR CODE) ================= */

/* ✅ APPROVE LOCAL GUIDE */
router.patch("/guides/approve", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const guide = await User.findOne({ email });

    if (!guide) {
      return res.status(404).json({ message: "Guide not found" });
    }

    if (guide.role !== "Local Guide") {
      return res.status(400).json({ message: "User is not a Local Guide" });
    }

    guide.approved = true;
    await guide.save();

    res.json({
      message: "Local Guide approved successfully",
      guide,
    });
  } catch (err) {
    console.error("Approve guide error:", err);
    res.status(500).json({ message: "Failed to approve guide" });
  }
});

/* ❌ REJECT LOCAL GUIDE (OPTIONAL BUT GOOD PRACTICE) */
router.patch("/guides/reject/:id", async (req, res) => {
  try {
    const guide = await User.findById(req.params.id);

    if (!guide) {
      return res.status(404).json({ message: "Guide not found" });
    }

    guide.approved = false;
    await guide.save();

    res.json({ message: "Local Guide rejected successfully" });
  } catch (err) {
    console.error("Reject guide error:", err);
    res.status(500).json({ message: "Failed to reject guide" });
  }
});

/* ================= BOOKING STATUS UPDATE ================= */
router.patch("/bookings/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({
      message: "Booking status updated successfully",
      booking,
    });
  } catch (err) {
    console.error("Booking status update error:", err);
    res.status(500).json({ message: "Failed to update booking status" });
  }
});

/* ================= MISSING ROUTES (YOUR CODE - UNCHANGED) ================= */
router.delete("/users/:email", async (req, res) => {
  try {
    const { email } = req.params;
    
    console.log(`🗑️ DELETE USER ATTEMPT: ${email}`);
    
    const deletedUser = await User.findOneAndDelete({ email });
    
    if (!deletedUser) {
      return res.status(404).json({ 
        message: `User with email ${email} not found` 
      });
    }
    
    console.log(`✅ DELETED USER: ${email}`);
    res.json({ 
      message: `User ${email} deleted successfully`,
      deletedCount: 1 
    });
    
  } catch (err) {
    console.error("❌ Delete user error:", err);
    res.status(500).json({ 
      message: "Server error deleting user" 
    });
  }
});

router.put("/users/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: req.body },
      { new: true }
    ).select("-password");
    
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(updatedUser);
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ================= ATTRACTIONS (ADMIN CRUD) ================= */

// ✅ CREATE ATTRACTION
router.post("/attractions", async (req, res) => {
  try {
    const attraction = new Attraction(req.body);
    await attraction.save();
    res.status(201).json(attraction);
  } catch (err) {
    console.error("Add attraction error:", err);
    res.status(500).json({ message: "Failed to add attraction" });
  }
});

// ✅ UPDATE ATTRACTION
router.put("/attractions/:id", async (req, res) => {
  try {
    const attraction = await Attraction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!attraction) {
      return res.status(404).json({ message: "Attraction not found" });
    }
    res.json(attraction);
  } catch (err) {
    res.status(500).json({ message: "Failed to update attraction" });
  }
});

// ✅ DELETE ATTRACTION (PERMANENT)
router.delete("/attractions/:id", async (req, res) => {
  try {
    const attraction = await Attraction.findByIdAndDelete(req.params.id);
    if (!attraction) {
      return res.status(404).json({ message: "Attraction not found" });
    }
    res.json({ message: "Attraction deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete attraction" });
  }
});

// ✅ GET ALL ATTRACTIONS (ADMIN VIEW) — KEEP THIS LAST
router.get("/attractions", async (_, res) => {
  try {
    const attractions = await Attraction.find().sort({ createdAt: -1 });
    res.json(attractions);
  } catch (err) {
    res.status(500).json({ message: "Failed to load attractions" });
  }
});

/* ================= 🔥 NEW FEATURES FOR AdminDashboard (ADDED ONLY) ================= */

// ✅ 5. DELETE BOOKING
router.delete("/bookings/:id", async (req, res) => {
  try {
    const deleted = await Booking.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete booking" });
  }
});

// ✅ 6. APPROVE PAYMENT
router.put("/bookings/:id/approve-payment", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { paymentStatus: "Approved" },
      { new: true }
    );
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    console.log(`✅ ADMIN APPROVED PAYMENT: ${booking._id}`);
    res.json({ message: "Payment approved successfully", booking });
  } catch (err) {
    console.error("Approve payment error:", err);
    res.status(500).json({ message: "Failed to approve payment" });
  }
});

// ✅ 7. REJECT PAYMENT
router.put("/bookings/:id/reject-payment", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { paymentStatus: "Rejected" },
      { new: true }
    );
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    console.log(`❌ ADMIN REJECTED PAYMENT: ${booking._id}`);
    res.json({ message: "Payment rejected successfully", booking });
  } catch (err) {
    console.error("Reject payment error:", err);
    res.status(500).json({ message: "Failed to reject payment" });
  }
});

// ✅ 8. UPDATE HOMESTAY UPI QR
router.put("/homestays/:id/upi-qr", async (req, res) => {
  try {
    const { upiQrImage } = req.body;
    const updated = await Homestay.findByIdAndUpdate(
      req.params.id,
      { upiQrImage },
      { new: true }
    );
    
    if (!updated) {
      return res.status(404).json({ message: "Homestay not found" });
    }
    
    res.json({ message: "UPI QR updated", homestay: updated });
  } catch (err) {
    res.status(500).json({ message: "Failed to update UPI QR" });
  }
});

// ✅ 9. CREATE HOMESTAY (POST)
router.post("/homestays", async (req, res) => {
  try {
    const homestay = new Homestay(req.body);
    await homestay.save();
    res.status(201).json(homestay);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ 10. UPDATE HOMESTAY (PUT)
router.put("/homestays/:id", async (req, res) => {
  try {
    const homestay = await Homestay.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!homestay) {
      return res.status(404).json({ message: "Homestay not found" });
    }
    res.json(homestay);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= PERMANENT DELETE HOMESTAY =================
router.delete("/homestays/:id", async (req, res) => {
  try {
    const homestay = await Homestay.findByIdAndDelete(req.params.id);

    if (!homestay) {
      return res.status(404).json({ message: "Homestay not found" });
    }

    console.log(`🔥 PERMANENTLY DELETED HOMESTAY: ${req.params.id}`);
    res.json({ message: "Homestay permanently deleted" });
  } catch (err) {
    console.error("Permanent delete homestay error:", err);
    res.status(500).json({ message: "Failed to delete homestay" });
  }
});




export default router;
