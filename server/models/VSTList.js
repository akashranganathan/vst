// models/VSTList.js
import mongoose from "mongoose";

const VSTSectionSchema = new mongoose.Schema({
  heading: {
    type: String,
    required: true,
    trim: true,
  },
  items: [
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
    },
  ],
  order: {
    type: Number,
    default: 0, // For controlling display order
  },
});

const VSTListSchema = new mongoose.Schema(
  {
    sections: [VSTSectionSchema],
  },
  { timestamps: true }
);

// We'll use one document containing all sections
export default mongoose.model("VSTList", VSTListSchema);
