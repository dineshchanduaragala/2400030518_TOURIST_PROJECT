import mongoose from "mongoose";

const attractionSchema = new mongoose.Schema({
  name: String,
  location: String,
  description: String,
  image: String,
}, { timestamps: true });

export default mongoose.model("Attraction", attractionSchema);
