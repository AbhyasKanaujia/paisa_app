const express = require("express");
const router = express.Router();
const tagController = require("../controllers/tagController");
const {
  validateCreateTag,
  validateUpdateTag
} = require("../validators/tagValidators");

// Get all tags for a user
router.get("/user/:userId", tagController.getTagsByUser);

// Create tag
router.post("/", validateCreateTag, tagController.createTag);

// Update tag (rename, change color, etc.)
router.patch("/:id", validateUpdateTag, tagController.updateTag);

// Archive or delete tag
router.delete("/:id", tagController.deleteTag);

module.exports = router;
