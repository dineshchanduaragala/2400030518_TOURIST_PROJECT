import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";


import authRoutes from "./routes/auth.js";
import publicRoutes from "./routes/public.js";
import touristRoutes from "./routes/tourist.js";
import guideRoutes from "./routes/guides.js";
import hostRoutes from "./routes/host.js";
import adminRoutes from "./routes/admin.js";


dotenv.config();


const app = express();


app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://2400030518-tourist-project.vercel.app"
  ],
  credentials: true
}));

app.use(express.json({ limit: "10mb" }));


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error(err));


app.use("/api/auth", authRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/tourist", touristRoutes);
app.use("/api/guides", guideRoutes);
app.use("/api/host", hostRoutes);
app.use("/api/admin", adminRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
