// // routes/ListsRoutes.js (update your existing file)

// import express from "express";
// import VSTList from "../models/VSTList.js";

// const router = express.Router();

// // GET - fetch current sections (already have this)
// router.get("/", async (req, res) => {
//   /* your existing code */
// });

// // POST - add new section (admin only)
// router.post("/section", async (req, res) => {
//   try {
//     const { heading, items } = req.body;

//     const vstDoc = await VSTList.findOne({});
//     if (!vstDoc) {
//       return res.status(404).json({ message: "VST List not initialized" });
//     }

//     const newSection = {
//       heading,
//       order: vstDoc.sections.length + 1,
//       items: items.map((name) => ({ name })),
//     };

//     vstDoc.sections.push(newSection);
//     await vstDoc.save();

//     res.json({ message: "Section added", sections: vstDoc.sections });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // PUT - update section (edit heading or items)
// router.put("/section/:index", async (req, res) => {
//   try {
//     const { index } = req.params;
//     const { heading, items } = req.body;

//     const vstDoc = await VSTList.findOne({});
//     if (!vstDoc || !vstDoc.sections[index]) {
//       return res.status(404).json({ message: "Section not found" });
//     }

//     vstDoc.sections[index].heading = heading;
//     vstDoc.sections[index].items = items.map((name) => ({ name }));

//     await vstDoc.save();
//     res.json({ message: "Section updated", sections: vstDoc.sections });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // DELETE - remove section
// router.delete("/section/:index", async (req, res) => {
//   try {
//     const { index } = req.params;

//     const vstDoc = await VSTList.findOne({});
//     if (!vstDoc || !vstDoc.sections[index]) {
//       return res.status(404).json({ message: "Section not found" });
//     }

//     vstDoc.sections.splice(index, 1);
//     // Re-order remaining sections
//     vstDoc.sections.forEach((sec, i) => (sec.order = i + 1));

//     await vstDoc.save();
//     res.json({ message: "Section deleted", sections: vstDoc.sections });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // POST - reorder sections
// router.post("/reorder", async (req, res) => {
//   try {
//     const { orderedIndexes } = req.body; // array like [2, 0, 1, 3]

//     const vstDoc = await VSTList.findOne({});
//     const newSections = orderedIndexes.map((idx) => vstDoc.sections[idx]);

//     vstDoc.sections = newSections.map((sec, i) => ({
//       ...sec.toObject(),
//       order: i + 1,
//     }));

//     await vstDoc.save();
//     res.json({ sections: vstDoc.sections });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// export default router;

// server/routes/ListsRoutes.js
// server/routes/ListsRoutes.js
import express from "express";
import VSTList from "../models/VSTList.js";

const router = express.Router();

// GET - fetch all sections (sorted by order)
router.get("/", async (req, res) => {
  try {
    const vstDoc = await VSTList.findOne({});
    if (!vstDoc || vstDoc.sections.length === 0) {
      return res.json({ sections: [] });
    }

    const sortedSections = vstDoc.sections
      .slice()
      .sort((a, b) => a.order - b.order);

    res.json({ sections: sortedSections });
  } catch (error) {
    console.error("GET /api/lists error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST - add new section
router.post("/section", async (req, res) => {
  try {
    let { heading, items = [] } = req.body;

    if (!heading || !heading.trim()) {
      return res.status(400).json({ message: "Heading is required" });
    }

    let vstDoc = await VSTList.findOne({});
    if (!vstDoc) {
      vstDoc = new VSTList({ sections: [] });
    }

    // Normalize items: accept string[] or {name: string}[]
    const normalizedItems = items
      .map((item) => {
        if (typeof item === "string") return { name: item.trim() };
        if (typeof item === "object" && item.name)
          return { name: item.name.trim() };
        return null;
      })
      .filter(Boolean);

    const newSection = {
      heading: heading.trim(),
      order: vstDoc.sections.length + 1,
      items: normalizedItems,
    };

    vstDoc.sections.push(newSection);
    await vstDoc.save();

    res.status(201).json({ message: "Section added successfully" });
  } catch (error) {
    console.error("POST /section error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT - update existing section
router.put("/section/:index", async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    let { heading, items = [] } = req.body;

    if (!heading || !heading.trim()) {
      return res.status(400).json({ message: "Heading is required" });
    }

    const vstDoc = await VSTList.findOne({});
    if (!vstDoc) {
      return res.status(404).json({ message: "VST list not found" });
    }

    if (index < 0 || index >= vstDoc.sections.length) {
      return res.status(404).json({ message: "Section not found" });
    }

    // Normalize items: accept string[] or {name: string}[]
    const normalizedItems = items
      .map((item) => {
        if (typeof item === "string") return { name: item.trim() };
        if (typeof item === "object" && item.name)
          return { name: item.name.trim() };
        return null;
      })
      .filter(Boolean);

    vstDoc.sections[index].heading = heading.trim();
    vstDoc.sections[index].items = normalizedItems;

    await vstDoc.save();
    res.json({ message: "Section updated successfully" });
  } catch (error) {
    console.error("PUT /section error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE - remove section
router.delete("/section/:index", async (req, res) => {
  try {
    const index = parseInt(req.params.index);

    const vstDoc = await VSTList.findOne({});
    if (!vstDoc) {
      return res.status(404).json({ message: "VST list not found" });
    }

    if (index < 0 || index >= vstDoc.sections.length) {
      return res.status(404).json({ message: "Section not found" });
    }

    vstDoc.sections.splice(index, 1);

    // Re-order remaining sections
    vstDoc.sections.forEach((sec, i) => {
      sec.order = i + 1;
    });

    await vstDoc.save();
    res.json({ message: "Section deleted successfully" });
  } catch (error) {
    console.error("DELETE /section error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST - reorder sections
router.post("/reorder", async (req, res) => {
  try {
    const { orderedIndexes } = req.body;

    if (!Array.isArray(orderedIndexes) || orderedIndexes.length === 0) {
      return res
        .status(400)
        .json({ message: "orderedIndexes array is required" });
    }

    const vstDoc = await VSTList.findOne({});
    if (!vstDoc) {
      return res.status(404).json({ message: "VST list not found" });
    }

    if (
      orderedIndexes.some((idx) => idx < 0 || idx >= vstDoc.sections.length)
    ) {
      return res.status(400).json({ message: "Invalid index in reorder" });
    }

    const reorderedSections = orderedIndexes.map((oldIndex) => {
      const section = vstDoc.sections[oldIndex];
      return { ...section, order: orderedIndexes.indexOf(oldIndex) + 1 };
    });

    vstDoc.sections = reorderedSections;
    await vstDoc.save();

    res.json({ message: "Order updated successfully" });
  } catch (error) {
    console.error("POST /reorder error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
