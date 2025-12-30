import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  touristEmail: String,
  touristName: String,
  homestayId: mongoose.Schema.Types.ObjectId,
  homestayTitle: String,
  checkinDate: String,
  checkoutDate: String,
  guests: Number,
  totalPrice: Number,
  bookingType: { type: String, default: "ONLINE" },
  status: { type: String, default: "Pending" },
  paymentStatus: { type: String, default: "Pending" },
}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);
