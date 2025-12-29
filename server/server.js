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
import { sendEmail } from "./utils/sendEmail.js"; // Nodemailer helper

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

// Root
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

// ==================== TICKETS WITH NODEMAILER ====================
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

    // Save ticket to MongoDB
    const ticket = await Ticket.create({
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
    });

    const time = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });

    // 1. Notify Admin (You)
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `New Support Ticket from ${name} - ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #f9f9f9; border-radius: 10px;">
          <h2 style="color: #d32f2f;">🚨 New Support Ticket</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Time:</strong> ${time}</p>
          <hr style="border: 1px dashed #ccc;" />
          <p><strong>Message:</strong></p>
          <div style="background: #fff; padding: 20px; border-radius: 8px; border-left: 5px solid #d32f2f;">
            <p style="white-space: pre-wrap;">${message.replace(
              /\n/g,
              "<br>"
            )}</p>
          </div>
          <p style="margin-top: 20px;">Reply to the customer directly or check the admin dashboard.</p>
        </div>
      `,
    });

    // 2. Auto-reply to Customer
    await sendEmail({
      to: email,
      subject: "Thank You! We've Received Your Support Ticket 🎧",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #111; color: #fff; padding: 30px; border-radius: 12px; text-align: center;">
          <h1 style="color: #4caf50;">Thank You, ${name}! ✅</h1>
          <p style="font-size: 18px;">Your support request has been received.</p>
          
          <div style="background: #222; padding: 25px; border-radius: 10px; margin: 30px 0; font-size: 16px;">
            <p style="font-style: italic; line-height: 1.6;">"${message}"</p>
          </div>
          
          <p style="font-size: 17px;">
            Our team will get back to you <strong>within 24-48 hours</strong>.<br>
            Need help faster?
          </p>
          
          <a href="https://wa.me/919876543210" style="display: inline-block; background: #25D366; color: white; padding: 15px 35px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 17px; margin: 20px 0;">
            📱 Chat on WhatsApp
          </a>
          
          <p style="color: #aaa; margin-top: 40px; font-size: 14px;">
            © 2025 VST Universe • All Rights Reserved
          </p>
        </div>
      `,
    });

    res.status(201).json({
      message:
        "Ticket submitted successfully! Check your email for confirmation.",
      ticketId: ticket._id,
    });
  } catch (err) {
    console.error("Ticket error:", err);
    res.status(500).json({ error: "Failed to submit ticket" });
  }
});

// GET all tickets (for admin)
app.get("/api/tickets", async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: "Failed to load tickets" });
  }
});

console.log("TICKET SYSTEM ACTIVE WITH NODEMAILER");

// Dynamic routes
const { default: planRouter } = await import("./routes/planRoutes.js");
const { default: ListsRoutes } = await import("./routes/ListsRoutes.js");
app.use("/api/plans", planRouter);
app.use("/api/lists", ListsRoutes);

console.log("PLAN & LIST ROUTES LOADED");

// Production static files
if (process.env.NODE_ENV === "production") {
  app.use(express.static(distPath));
  app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
}

// Keep alive for Render
if (process.env.NODE_ENV === "production") {
  setInterval(
    () => axios.get("https://vst-universe.onrender.com").catch(() => {}),
    300000
  );
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});