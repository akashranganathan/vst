import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  email: { type: String, required: true },
  plan: { type: String, required: true },
  storage: { type: String, required: true },
  price: { type: String, required: true },
  transactionId: { type: String, required: true, unique: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("Payment", paymentSchema);
