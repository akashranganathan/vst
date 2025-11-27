import mongoose from "mongoose";
import dotenv from "dotenv";
import Review from "./models/Review.js"; // Adjust path if needed

dotenv.config();

const seedReviews = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const reviews = [
      {
        email: "adhithyadinesh11@gmail.com",
        text: "This is one amazing investment! Totally worth it! Thank you so much Akash bro for helping me out! And I’ll definitely recommend all the budding producers to try this out!",
        rating: 5,
        createdAt: new Date("2025-07-25T08:21:00.000Z"),
      },
      {
        email: "",
        text: "Aakash and team have been very prompt and committed in delivering the product and associated services. Very accommodative and always available to clarify and help along the process. Very happy to work with him :) Best wishes",
        rating: 5,
        createdAt: new Date("2025-06-17T08:19:00.000Z"),
      },
      {
        email: "Pradeesams@gmail.com",
        text: "I have purchased 2TB plugins and installation of DAW with akash.Such a wonderful person and workaholic.He guided me to purchase and cleared my every doubts about softwares as well plugins.Thanks for guiding me and wonderful services.",
        rating: 5,
        createdAt: new Date("2025-05-22T05:31:00.000Z"),
      },
      {
        email: "Thennavan",
        text: "I bought 4Tb package with all vst's plugins and it's really amazing and most importantly incase if there is any problem out there ,(Aakash bro)he is always available to rectify and even the cost is reasonable. Aakash bro is a kind of person who thinks from customers pov so any of you having idea to buy, this is the best site i could refer.",
        rating: 5,
        createdAt: new Date("2025-04-10T03:32:00.000Z"),
      },
      {
        email: "melcmusic03@gmail.com",
        text: "Brother ur awesome Fabulous work u did",
        rating: 5,
        createdAt: new Date("2025-03-13T12:31:00.000Z"),
      },
    ];

    await Review.deleteMany(); // Optional: wipe existing reviews
    await Review.insertMany(reviews);
    console.log("✅ All reviews successfully inserted!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to seed reviews:", err.message);
    process.exit(1);
  }
};

seedReviews();
