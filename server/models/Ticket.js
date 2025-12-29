// server/models/Ticket.js
import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Customer", trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, default: "Support Request", trim: true },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["open", "in-progress", "resolved", "closed"],
      default: "open",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Ticket", ticketSchema);
