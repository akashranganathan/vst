import express from "express";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import axios from "axios";

import Review from "./models/Review.js";
import Payment from "./models/Payment.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3500;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, "../dist");

// CORS manually
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  next();
});

app.use(express.json());

// MongoDB
await mongoose.connect(process.env.MONGODB_URI);
console.log("MongoDB Connected");

// Root
app.get("/", (req, res) => res.send("VST Universe API Running"));

// Reviews
app.get("/api/reviews", async (req, res) => {
  try {
    res.json(await Review.find().sort({ createdAt: -1 }));
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

app.post("/api/reviews", async (req, res) => {
  try {
    res.status(201).json(await Review.create(req.body));
  } catch (err) {
    res.status(500).json({ error: "Failed" });
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
    res.status(500).json({ error: "Failed" });
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
      ? res.status(409).json({ error: "ID exists" })
      : res.status(500).json({ error: "Failed" });
  }
});

// DYNAMIC IMPORT AFTER EVERYTHING ELSE
const { default: planRouter } = await import("./routes/planRoutes.js");
app.use("/api/plans", planRouter);
console.log("PLAN ROUTES LOADED — ADMIN WORKS");

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
  console.log(`Server running on port ${PORT}`);
});
