import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

/* ================= SIGNUP ================= */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role, mobile, profileImage } = req.body;

    // 🚫 BLOCK ADMIN REGISTRATION
    if (role === "Admin") {
      return res.status(403).json({
        success: false,
        message: "Admin account cannot be created via signup",
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role,
      mobile,
      profileImage,
      approved: role === "Tourist",
    });

    const token = jwt.sign(
      { email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        mobile: user.mobile,
        profileImage: user.profileImage || "",
        isApproved: user.approved,
      },
    });
  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Signup failed",
    });
  }
});

/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({
      email,
      role: { $regex: new RegExp(`^${role}$`, "i") },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 🚫 BLOCK ADMIN LOGIN FROM NORMAL LOGIN
    if (user.role === "Admin") {
      return res.status(403).json({
        success: false,
        message: "Admin must login via Admin Login page",
      });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (user.role !== "Tourist" && !user.approved) {
      return res.status(403).json({
        success: false,
        message: "Approval pending",
      });
    }

    const token = jwt.sign(
      { email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        mobile: user.mobile,
        profileImage: user.profileImage || "",
        isApproved: user.approved,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
});

export default router;
