const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const {
  validateCreateAccount,
  validateUpdateAccount
} = require("../validators/accountValidators");

// Get all accounts for a user
router.get("/user/:userId", accountController.getAccountsByUser);

// Create account
router.post("/", validateCreateAccount, accountController.createAccount);

// Update account
router.patch("/:id", validateUpdateAccount, accountController.updateAccount);

// Archive or delete account
router.delete("/:id", accountController.deleteAccount);

module.exports = router;
