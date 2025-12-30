import mongoose from "mongoose";

const homestaySchema = new mongoose.Schema(
  {
    title: String,
    location: String,
    price: Number,
    description: String,
    amenities: [String],
    image: String,
    upiQrImage: String,
    hostEmail: String,
    approved: { type: Boolean, default: false },

    // ✅ NEW FIELD (SOFT DELETE)
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Homestay", homestaySchema);
