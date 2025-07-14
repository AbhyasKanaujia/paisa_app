const express = require("express");
const router = express.Router();
const batchController = require("../controllers/batchController");
const { validateCreateBatch } = require("../validators/batchValidators");

// Get all batches for a user
router.get("/user/:userId", batchController.getBatchesByUser);

// Get one batch
router.get("/:id", batchController.getBatchById);

// Create batch
router.post("/", validateCreateBatch, batchController.createBatch);

// Delete batch
router.delete("/:id", batchController.deleteBatch);

module.exports = router;
