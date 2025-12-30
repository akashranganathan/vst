// import express from "express";
// import path from "path";
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import { fileURLToPath } from "url";
// import axios from "axios";

// import Review from "./models/Review.js";
// import Payment from "./models/Payment.js";

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 3500;

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const distPath = path.resolve(__dirname, "../dist");

// // CORS manually
// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "GET, POST, PUT, DELETE, OPTIONS"
//   );
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   if (req.method === "OPTIONS") return res.status(200).end();
//   next();
// });

// // CORS - dynamic and future-proof
// // app.use((req, res, next) => {
// //   const origin = req.headers.origin;

// //   const allowedOrigins = [
// //     "http://localhost:5173", // Current Vite dev
// //     "http://localhost:3000", // Common alternative
// //     "http://127.0.0.1:5173",
// //     "http://127.0.0.1:3000",
// //     "https://vst-universe.onrender.com", // Your production URL
// //     "https://your-custom-domain.com", // Add your future domain here
// //   ];

// //   // Allow any localhost origin (covers any port change)
// //   if (
// //     /^http:\/\/localhost(:\d+)?$/.test(origin) ||
// //     /^http:\/\/127\.0.0.1(:\d+)?$/.test(origin)
// //   ) {
// //     res.setHeader("Access-Control-Allow-Origin", origin);
// //   } else if (allowedOrigins.includes(origin)) {
// //     res.setHeader("Access-Control-Allow-Origin", origin);
// //   }

// //   res.setHeader(
// //     "Access-Control-Allow-Methods",
// //     "GET, POST, PUT, DELETE, OPTIONS"
// //   );
// //   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
// //   res.setHeader("Access-Control-Allow-Credentials", "true");

// //   if (req.method === "OPTIONS") {
// //     res.status(200).end();
// //     return;
// //   }

// //   next();
// // });

// app.use(express.json());

// // MongoDB
// await mongoose.connect(process.env.MONGODB_URI);
// console.log("MongoDB Connected");

// // Root
// app.get("/", (req, res) => res.send("VST Universe API Running"));

// // Reviews
// app.get("/api/reviews", async (req, res) => {
//   try {
//     res.json(await Review.find().sort({ createdAt: -1 }));
//   } catch (err) {
//     res.status(500).json({ error: "Failed" });
//   }
// });

// app.post("/api/reviews", async (req, res) => {
//   try {
//     res.status(201).json(await Review.create(req.body));
//   } catch (err) {
//     res.status(500).json({ error: "Failed" });
//   }
// });

// // Payments
// app.get("/payments", async (req, res) => {
//   try {
//     const { transactionId } = req.query;
//     const matches = await Payment.find({
//       transactionId: transactionId?.trim().toLowerCase(),
//     });
//     res.json(matches);
//   } catch (err) {
//     res.status(500).json({ error: "Failed" });
//   }
// });

// app.post("/payments", async (req, res) => {
//   try {
//     const normalizedId = (req.body.transactionId || "").trim().toLowerCase();
//     const payment = await Payment.create({
//       ...req.body,
//       transactionId: normalizedId,
//     });
//     res.status(201).json(payment);
//   } catch (err) {
//     err.code === 11000
//       ? res.status(409).json({ error: "ID exists" })
//       : res.status(500).json({ error: "Failed" });
//   }
// });

// // DYNAMIC IMPORT AFTER EVERYTHING ELSE
// const { default: planRouter } = await import("./routes/planRoutes.js");
// const { default: ListsRoutes } = await import("./routes/ListsRoutes.js");
// app.use("/api/plans", planRouter);
// app.use("/api/lists", ListsRoutes);
// console.log("PLAN ROUTES LOADED — ADMIN WORKS");
// console.log("VST LISTS ROUTES LOADED — /api/lists is now active");

// // Serve frontend
// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(distPath));
//   app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
// }

// // Keep alive
// if (process.env.NODE_ENV === "production") {
//   setInterval(
//     () => axios.get("https://vst-universe.onrender.com").catch(() => {}),
//     300000
//   );
// }

// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`Server running on port ${PORT}`);
// });

import express from "express";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import axios from "axios";

import Review from "./models/Review.js";
import Payment from "./models/Payment.js";
import Ticket from "./models/Ticket.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3500;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, "../dist");

// CORS
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

// MongoDB Connection
await mongoose.connect(process.env.MONGODB_URI);
console.log("MongoDB Connected");

// Root endpoint
app.get("/", (req, res) => res.send("VST Universe API Running"));

// ==================== REVIEWS ====================
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

// ==================== PAYMENTS ====================
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

// ==================== TICKETS ====================
// Explicit OPTIONS handler to fix 405 on Render
app.options("/api/tickets", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.status(200).end();
});

// POST - Save ticket (email sent from frontend via EmailJS)
app.post("/api/tickets", async (req, res) => {
  try {
    const {
      name = "Customer",
      email,
      subject = "Support Request",
      message,
    } = req.body;

    if (!email || !message) {
      return res.status(400).json({ error: "Email and message are required" });
    }

    const ticket = await Ticket.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
    });

    res.status(201).json({
      message: "Query sent successfully!",
      ticketId: ticket._id,
    });
  } catch (err) {
    console.error("Ticket save error:", err);
    res.status(500).json({ error: "Failed to save query" });
  }
});

// GET - All tickets (for admin dashboard later)
app.get("/api/tickets", async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: "Failed to load tickets" });
  }
});

console.log("TICKET SYSTEM ACTIVE (Email via EmailJS)");

// Dynamic routes
const { default: planRouter } = await import("./routes/planRoutes.js");
const { default: ListsRoutes } = await import("./routes/ListsRoutes.js");
app.use("/api/plans", planRouter);
app.use("/api/lists", ListsRoutes);

console.log("PLAN & LIST ROUTES LOADED");

// PRODUCTION STATIC FILES — MUST BE LAST!
if (process.env.NODE_ENV === "production") {
  app.use(express.static(distPath));
  app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
}

// Keep alive ping
if (process.env.NODE_ENV === "production") {
  setInterval(
    () => axios.get("https://vst-universe.onrender.com").catch(() => {}),
    300000
  );
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
