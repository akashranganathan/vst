import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  email: String,
  text: String,
  rating: Number,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Review", reviewSchema);
