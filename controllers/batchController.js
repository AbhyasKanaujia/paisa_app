const Batch = require("../models/Batch");

// GET /api/batches/user/:userId
exports.getBatchesByUser = async (req, res) => {
  try {
    const batches = await Batch.find({ user_id: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(batches);
  } catch (error) {
    console.error("Error fetching batches:", error);
    res.status(500).json({ message: "Failed to fetch batches" });
  }
};

// GET /api/batches/:id
exports.getBatchById = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }
    res.status(200).json(batch);
  } catch (error) {
    console.error("Error fetching batch:", error);
    res.status(500).json({ message: "Failed to fetch batch" });
  }
};

// POST /api/batches
exports.createBatch = async (req, res) => {
  try {
    const { user_id, pinned_context, raw_inputs } = req.body;

    if (!raw_inputs || !Array.isArray(raw_inputs) || raw_inputs.length === 0) {
      return res.status(400).json({ message: "raw_inputs must be a non-empty array" });
    }

    const batch = new Batch({
      user_id,
      entry_count: raw_inputs.length,
      pinned_context,
      raw_inputs
    });

    await batch.save();
    res.status(201).json(batch);
  } catch (error) {
    console.error("Error creating batch:", error);
    res.status(400).json({ message: "Failed to create batch", error: error.message });
  }
};

// DELETE /api/batches/:id
exports.deleteBatch = async (req, res) => {
  try {
    const deleted = await Batch.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Batch not found" });
    }
    res.status(200).json({ message: "Batch deleted successfully" });
  } catch (error) {
    console.error("Error deleting batch:", error);
    res.status(500).json({ message: "Failed to delete batch" });
  }
};
