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

    const plans = [
      {
        id: "basic",
        name: "Basic Pack",
        storage: "500GB",
        price: "₹ 4,999",
        originalPrice: "₹ 5,999",
        tagline: "Good for starters",
        popular: false,
      },
      {
        id: "standard",
        name: "Standard Pack",
        storage: "1TB",
        price: "₹ 9,999",
        originalPrice: null,
        tagline: "Best for beginners",
        popular: false,
      },
      {
        id: "ultimate",
        name: "Ultimate Pack",
        storage: "2TB",
        price: "₹ 19,999",
        originalPrice: "₹ 24,999",
        tagline: "For pros",
        popular: true,
      },
    ];

    await Plan.deleteMany({});
    await Plan.insertMany(plans);
    console.log("✅ Plans seeded");
    process.exit();
  })
  .catch((err) => console.error(err));
