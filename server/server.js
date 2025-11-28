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

// Manual CORS headers — replaces the broken cors package
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") return res.status(200).end();
  next();
});

app.use(express.json());

// MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Error:", err));

// Routes
app.get("/", (req, res) => res.send("VST Universe API Running"));

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

// Dynamic import for plan routes
import("./routes/planRoutes.js")
  .then((module) => {
    app.use("/api/plans", module.default);
    console.log("PLAN ROUTES LOADED — ADMIN WORKS NOW");
  })
  .catch((err) => console.error("Load error:", err));

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
