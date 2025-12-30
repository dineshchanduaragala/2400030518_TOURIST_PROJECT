import mongoose from "mongoose";

const guideProfileSchema = new mongoose.Schema({
  email: String,
  bio: String,
  languages: [String],
  expertise: [String],
  basePrice: Number,
  availability: [{
    date: String,
    morning: Boolean,
    evening: Boolean,
  }],
  portfolio: [{
    title: String,
    description: String,
    image: String,
  }],
}, { timestamps: true });

export default mongoose.model("GuideProfile", guideProfileSchema);
