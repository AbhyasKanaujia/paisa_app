const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const {
  validateCreateOrUpdateUser,
  validateUpdatePreferences
} = require("../validators/userValidators");

// Get current user settings
router.get("/:userId", userController.getUser);

// Create or update user
router.post("/", validateCreateOrUpdateUser, userController.createOrUpdateUser);

// Update preferences (e.g., pinned context)
router.patch("/:userId/preferences", validateUpdatePreferences, userController.updatePreferences);

module.exports = router;
