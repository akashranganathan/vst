import express from "express";
import cors from "cors";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import axios from "axios";

// Routes
//import reviewRoutes from "./routes/reviewRoutes.js"; // Optional: if you move reviews too
import planRouter from "./routes/planRoutes.js"; // Your clean plan routes

// Models (only needed if you keep inline routes)
import Review from "./models/Review.js";
import Payment from "./models/Payment.js";
//import Payment from "./models/Payment.js";
// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3500;

// __dirname fix for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, "../dist");
// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB Atlas");
    console.log("DB Name:", mongoose.connection.name);
  })
  .catch((err) => console.error("MongoDB connection error:", err.message));

// Middleware
app.use(cors());
app.use(express.json());

// ==================== API ROUTES ====================

// Root (for uptime checks on Render)
app.get("/", (req, res) => {
  res.send("VST Universe API is LIVE & READY!");
});

// Reviews Routes (you can keep inline or move to routes/reviewRoutes.js)
app.get("/api/reviews", async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error("Error fetching reviews:", err.message);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

app.post("/api/reviews", async (req, res) => {
  try {
    const review = await Review.create(req.body);
    res.status(201).json(review);
  } catch (err) {
    console.error("Error saving review:", err.message);
    res.status(500).json({ error: "Failed to save review" });
  }
});

// Payments Routes
app.get("/payments", async (req, res) => {
  try {
    const { transactionId } = req.query;
    const matches = await Payment.find({
      transactionId: transactionId?.trim().toLowerCase(),
    });
    res.json(matches);
  } catch (err) {
    console.error("Error fetching payments:", err.message);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
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
      console.error("Payment save failed:", err.message);
      res.status(500).json({ error: "Failed to save payment." });
    }
  }
});

// ==================== PLANS ROUTES (USING ROUTER) ====================
app.use("/api/plans", planRouter); // This enables ALL plan endpoints

// ==================== PRODUCTION: Serve Frontend ====================
if (process.env.NODE_ENV === "production") {
  app.use(express.static(distPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// ==================== Keep Render Awake (Self-ping) ====================
if (process.env.NODE_ENV === "production") {
  setInterval(() => {
    axios
      .get("https://vst-universe.onrender.com")
      .then(() => console.log("Self-ping successful"))
      .catch((err) => console.error("Self-ping failed:", err.message));
  }, 5 * 60 * 1000); // Every 5 minutes
}

// Start Server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});
