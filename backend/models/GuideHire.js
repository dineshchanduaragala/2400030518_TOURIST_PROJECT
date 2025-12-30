import mongoose from "mongoose";

const guideHireSchema = new mongoose.Schema(
  {
    guideEmail: String,
    touristEmail: String,
    touristName: String,
    message: String,
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Completed"],
      default: "Pending",
    },
    agreedPrice: Number,
  },
  { timestamps: true }
);

export default mongoose.model("GuideHire", guideHireSchema);
