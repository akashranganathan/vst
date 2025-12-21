// seeds/seedVSTList.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import VSTList from "./models/VSTList.js";

dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB");

    const vstData = {
      sections: [
        {
          heading: "Full Collections & Complete Bundles",
          order: 1,
          items: [
            { name: "Native instruments komplete full collections" },
            { name: "Arturia complete bundle X" },
            { name: "Elastik complete Bundle with full expansions" },
            { name: "Spectrasonics full bundle" },
            { name: "Sonic academy Ana 2 Ultimate bundle" },
            { name: "Nexus 5 Complete Bundle" },
          ],
        },
        {
          heading: "Premium Synths & Engines",
          order: 2,
          items: [
            { name: "Serum" },
            { name: "Spire" },
            { name: "Vital Pro with complete expansions" },
            { name: "Swan Engine Bundle" },
            { name: "Swarpplug 4" },
          ],
        },
        {
          heading: "Guitar & Ethnic Instruments",
          order: 3,
          items: [
            { name: "Ample sounds guitar bundle" },
            { name: "Taqsim Solo Ethnic synth" },
          ],
        },
        {
          heading: "Drums, Percussion & Instruments",
          order: 4,
          items: [
            { name: "Ujam instruments bundle" },
            { name: "XLN Audio Bundle" },
            { name: "Toontrack Bundle" },
          ],
        },
      ],
    };

    await VSTList.deleteMany({});
    await VSTList.create(vstData);

    console.log("✅ Multiple VST sections with headings seeded successfully!");
    process.exit();
  })
  .catch((err) => {
    console.error("❌ Error seeding VST list:", err);
    process.exit(1);
  });
