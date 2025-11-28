import express from "express";
import cors from "cors";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import axios from "axios";

// Models
import Review from "./models/Review.js";
import Payment from "./models/Payment.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3500;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, "../dist");

// MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Error:", err));

// Middleware
app.use(cors());
app.use(express.json());

// Root
app.get("/", (req, res) => res.send("VST Universe API Running"));

// Reviews
app.get("/api/reviews", async (req, res) => {
  try {
    res.json(await Review.find().sort({ createdAt: -1 }));
  } catch (err) {
    res.status(500).json({ error: "Reviews failed" });
  }
});

app.post("/api/reviews", async (req, res) => {
  try {
    res.status(201).json(await Review.create(req.body));
  } catch (err) {
    res.status(500).json({ error: "Save failed" });
  }
});

// Payments
app.get("/payments", async (req, res) => {
  try {
    const { transactionId } = req.query;
    const matches = await Payment.find({
      transactionId: transactionId?.trim().toLowerCase(),
    });
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: "Fetch failed" });
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
    err.code === 11000
      ? res.status(409).json({ error: "Transaction ID exists" })
      : res.status(500).json({ error: "Payment failed" });
  }
});

// DYNAMIC IMPORT — THIS IS THE ONLY ONE ALLOWED
import("./routes/planRoutes.js").then((module) => {
  app.use("/api/plans", module.default);
  console.log("PLAN ROUTES LOADED SUCCESSFULLY");
});

// Serve frontend
if (process.env.NODE_ENV === "production") {
  app.use(express.static(distPath));
  app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
}

// Keep alive
if (process.env.NODE_ENV === "production") {
  setInterval(
    () => axios.get("https://vst-universe.onrender.com").catch(() => {}),
    300000
  );
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server LIVE on port ${PORT}`);
});
