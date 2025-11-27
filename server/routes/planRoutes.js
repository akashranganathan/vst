import express from "express";
import Plan from "../models/Plan.js";

const router = express.Router();

// ======================
// GET all plans
// ======================
router.get("/", async (req, res) => {
  try {
    const plans = await Plan.find();
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch plans" });
  }
});

// ======================
// GET a single plan by id
// ======================
router.get("/:id", async (req, res) => {
  try {
    const plan = await Plan.findOne({ id: req.params.id });
    if (!plan) return res.status(404).json({ error: "Plan not found" });

    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch plan" });
  }
});

// ======================
// POST - Add new plan
// ======================
router.post("/", async (req, res) => {
  try {
    const newPlan = await Plan.create(req.body);
    res.status(201).json(newPlan);
  } catch (err) {
    res.status(400).json({ error: "Failed to create plan", details: err });
  }
});

// ======================
// PUT - Update plan
// ======================
router.put("/:id", async (req, res) => {
  try {
    const updated = await Plan.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Plan not found" });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Failed to update plan" });
  }
});

// ======================
// DELETE - Remove plan
// ======================
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Plan.findOneAndDelete({ id: req.params.id });

    if (!deleted) return res.status(404).json({ error: "Plan not found" });

    res.json({ message: "Plan deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete plan" });
  }
});

export default router;
