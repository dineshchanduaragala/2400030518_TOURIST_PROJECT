import express from "express";
import jwt from "jsonwebtoken";
import Homestay from "../models/Homestay.js";
import Booking from "../models/Booking.js";

const router = express.Router();
router.use(express.json());

/* ================= AUTH MIDDLEWARE ================= */
router.use((req, res, next) => {
  const auth = req.headers.authorization;

  if (auth && auth.startsWith("Bearer ")) {
    try {
      const token = auth.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.hostEmail = decoded.email;
    } catch (err) {
      console.error("JWT error:", err.message);
    }
  }
  next();
});

/* ================= DASHBOARD ================= */
router.get("/dashboard", async (req, res) => {
  try {
    const hostEmail = req.hostEmail;
    if (!hostEmail) return res.status(401).json({ message: "Unauthorized" });

    const homestays = await Homestay.find({
      hostEmail,
      isDeleted: false,
    });

    const homestayIds = homestays.map(h => h._id);

    const bookings = await Booking.find({
      homestayId: { $in: homestayIds },
    });

    res.json({ homestays, bookings });
  } catch (err) {
    res.status(500).json({ message: "Dashboard error" });
  }
});

/* ================= ADD HOMESTAY ================= */
router.post("/homestays", async (req, res) => {
  try {
    if (!req.hostEmail)
      return res.status(401).json({ message: "Unauthorized" });

    const homestay = await Homestay.create({
      ...req.body,
      hostEmail: req.hostEmail,
      approved: false,
      isDeleted: false,
    });

    res.status(201).json({ message: "Homestay added", homestay });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================= UPDATE UPI QR ================= */
router.put("/homestays/:id/upi-qr", async (req, res) => {
  const homestay = await Homestay.findByIdAndUpdate(
    req.params.id,
    { upiQrImage: req.body.upiQrImage },
    { new: true }
  );
  res.json({ message: "UPI QR updated", homestay });
});

/* ================= OFFLINE BOOKING ================= */
router.post("/offline-booking", async (req, res) => {
  const booking = new Booking({
    ...req.body,
    hostEmail: req.hostEmail,
    bookingType: "OFFLINE",
    status: "Approved",
    paymentStatus: "Approved",
  });
  await booking.save();
  res.status(201).json({ message: "Offline booking created", booking });
});

/* =====================================================
   ✅ NEW: HOST APPROVES / REJECTS BOOKING STATUS
   ===================================================== */
router.put("/bookings/:id/status/:action", async (req, res) => {
  try {
    const { id, action } = req.params;

    const status = action === "approve" ? "Approved" : 
                  action === "reject" ? "Rejected" : null;

    if (!status) {
      return res.status(400).json({ message: "Invalid action" });
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({ message: `Booking ${status.toLowerCase()}d`, booking });
  } catch (err) {
    res.status(500).json({ message: "Failed to update booking status" });
  }
});

/* =====================================================
   ✅ PAYMENT APPROVAL (UNCHANGED - ALREADY WORKS)
   ===================================================== */
router.put("/bookings/:id/approve", async (req, res) => {
  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { paymentStatus: "Approved" },
    { new: true }
  );
  res.json({ message: "Payment approved", booking });
});

router.put("/bookings/:id/reject", async (req, res) => {
  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { paymentStatus: "Rejected" },
    { new: true }
  );
  res.json({ message: "Payment rejected", booking });
});

export default router;
