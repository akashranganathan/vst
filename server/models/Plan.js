import mongoose from "mongoose";

const PlanSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: String,
    storage: String,
    price: String,
    originalPrice: String,
    tagline: String,
    popular: Boolean,
  },
  { timestamps: true }
);

export default mongoose.model("Plan", PlanSchema);
