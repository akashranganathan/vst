// models/Plan.js
import mongoose from "mongoose";

const PlanSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: String,
    storage: String,

    // NEW: Separate pricing
    priceIndia: String, // e.g., "₹18,499/-"
    priceForeign: String, // e.g., "$24,499/-"

    originalPrice: String, // optional, for strikethrough (can be India or both)
    tagline: String,
    popular: Boolean,

    // NEW: Bullet features
    features: [String], // Array of strings like "Digital Audio Workstation (DAW)"
  },
  { timestamps: true }
);

export default mongoose.model("Plan", PlanSchema);
