import express from "express";
import Booking from "../models/Booking.js";
import Homestay from "../models/Homestay.js";

const router = express.Router();

/* ================= CREATE BOOKING ================= */
router.post("/bookings", async (req, res) => {
  try {
    const {
      touristEmail,
      touristName,
      homestayId,
      homestayTitle,
      checkinDate,
      checkoutDate,
      guests,
      totalPrice,
    } = req.body;

    if (
      !touristEmail ||
      !homestayId ||
      !checkinDate ||
      !checkoutDate ||
      !totalPrice
    ) {
      return res.status(400).json({
        message: "Missing required booking fields",
      });
    }

    const homestay = await Homestay.findById(homestayId);
    if (!homestay) {
      return res.status(404).json({
        message: "Homestay not found",
      });
    }

    const booking = await Booking.create({
      touristEmail,
      touristName,
      homestayId,
      homestayTitle,
      checkinDate,
      checkoutDate,
      guests,
      totalPrice,
      paymentStatus: "Pending",
    });

    res.status(201).json(booking);
  } catch (err) {
    console.error("Create booking error:", err);
    res.status(500).json({
      message: "Failed to create booking",
    });
  }
});

/* ================= GET TOURIST BOOKINGS ================= */
router.get("/bookings/:email", async (req, res) => {
  try {
    const bookings = await Booking.find({
      touristEmail: req.params.email,
    }).sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error("Fetch bookings error:", err);
    res.status(500).json({
      message: "Failed to fetch bookings",
    });
  }
});

/* ===================================================== */
/* ✅ ADDITIONAL ROUTES (COMPATIBILITY) */
/* ===================================================== */
router.post("/", async (req, res) => {
  req.url = "/bookings";
  router.handle(req, res);
});

router.get("/:email", async (req, res) => {
  req.url = `/bookings/${req.params.email}`;
  router.handle(req, res);
});

export default router;
