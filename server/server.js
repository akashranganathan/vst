import express from "express";
import cors from "cors";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import axios from "axios";

// Load .env
dotenv.config();

// Models
import Review from "./models/Review.js";
import Payment from "./models/Payment.js";

// Express setup
const app = express();
const PORT = process.env.PORT || 3500;

// __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    console.log("📂 Using DB:", mongoose.connection.name);
  })
  .catch((err) => console.error("❌ MongoDB Error:", err));

// Middleware
app.use(cors());
app.use(express.json());

// --- API ROUTES ---

// Root route — required to prevent 502 from self-ping or direct access
app.get("/", (req, res) => {
  res.send("✅ VST Universe API is live on Render");
});

// Reviews
app.get("/api/reviews", async (req, res) => {
  const reviews = await Review.find().sort({ createdAt: -1 });
  res.json({ reviews });
});

app.post("/api/reviews", async (req, res) => {
  const review = await Review.create(req.body);
  res.status(201).json(review);
});

// Payments
app.get("/payments", async (req, res) => {
  const { transactionId } = req.query;
  const matches = await Payment.find({
    transactionId: transactionId?.trim().toLowerCase(),
  });
  res.json(matches);
});

app.post("/payments", async (req, res) => {
  try {
    const normalizedId = (req.body.transactionId || "").trim().toLowerCase();
    const payment = await Payment.create({
      ...req.body,
      transactionId: normalizedId,
    });
    res.status(201).json(payment);
  } catch (err) {
    if (err.code === 11000) {
      res.status(409).json({ error: "Transaction ID already exists." });
    } else {
      res.status(500).json({ error: "Failed to save payment." });
    }
  }
});

// Serve frontend from dist (if deploying frontend via same server)
const distPath = path.resolve(__dirname, "../dist");
app.use(express.static(distPath));

// Wildcard route to support React Router (optional)
app.get("/*all", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// Keep Render backend awake (ping every 5 mins)
setInterval(() => {
  axios
    .get("https://vst-universe.onrender.com")
    .then(() => console.log("🔁 Self-ping successful"))
    .catch((err) => console.error("❌ Self-ping failed:", err.message));
}, 5 * 60 * 1000);

// Start server on 0.0.0.0 (required for Render)
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
