// seedPlans.js (or your existing seed file)
import mongoose from "mongoose";
import dotenv from "dotenv";
import Plan from "./models/Plan.js";

dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("✅ Connected to MongoDB");

    // Only basic structure – features will be added via Admin
    const plans = [
      {
        id: "Standard Pack",
        name: "Standard Pack",
        storage: "1TB",
        priceIndia: "₹9,999/-",
        priceForeign: "₹14,999/-",
        tagline: "Best for Beginners",
        popular: false,
        features: [
          "Digital Audio Workstation (DAW)",
          "1TB Music Production VST Instruments",
          "Essential Mixing & Mastering Tools",
          "3 Months Free Technical Support",
          "Lifetime Community Support",
        ],
      },
      {
        id: "Studio Pack",
        name: "Studio Pack",
        storage: "2TB",
        priceIndia: "₹18,499/-",
        priceForeign: "₹24,499/-",
        tagline: " Best for Intermediate Producers",
        popular: false,
        features: [
          "Digital Audio Workstation (DAW)",
          "2TB VST Instruments & Music Libraries",
          "Mid-Level Mixing & Mastering Plugins",
          "3 Months Free Technical Support",
          "Lifetime Community Support",
        ],
      },
      {
        id: "Pro Pack",
        name: "Pro Pack",
        storage: "4TB",
        priceIndia: "₹34,999/-",
        priceForeign: "₹41,999/-",
        tagline: "Best for Professional Music Producers & Composers",
        popular: true,
        features: [
          "Digital Audio Workstation (DAW)",
          "4TB Professional VST Instruments & Sample Packs",
          "Advanced Mixing & Mastering Plugins",
          "6 Months Free Technical Support",
          "Lifetime Community Support",
        ],
      },

      {
        id: "Ultimate Pack",
        name: "Ultimate Pack",
        storage: "8TB",
        priceIndia: "₹49,999/-",
        priceForeign: "₹57,999/-",
        tagline: "Best for Professional Composers & Background Score Producers",
        popular: true,
        features: [
          "Digital Audio Workstation (DAW)",
          "8TB VST Instruments & Sound Libraries",
          "Advanced Mixing & Mastering Plugins",
          "Professional Sample Packs",
          "Third-Party Preset Expansions",
          "1 Year Free Technical Support",
          "Lifetime Community Support ",
        ],
      },

      {
        id: "Mega Pack",
        name: "Mega Pack",
        storage: "16TB",
        priceIndia: "₹69,999/-",
        priceForeign: "₹79,999/-",
        tagline:
          "Best for Music Composers, Background Score Producers & Audio Post-Production",
        popular: true,
        features: [
          "Digital Audio Workstation (DAW)",
          "16TB Premium VST Instruments & Libraries",
          "Preset & Expansion Packs",
          "SFX Libraries",
          "Sound Design Plugins",
          "Advanced Mixing & Mastering Plugins",
          "Surround Sound Plugins",
          "1 Year Priority Technical Support",
          "Lifetime Community Support",
        ],
      },
    ];

    await Plan.deleteMany({});
    await Plan.insertMany(plans);
    console.log("✅ Plans seeded (features to be added from Admin)");
    process.exit();
  })
  .catch((err) => console.error(err));
