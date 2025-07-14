const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");
const {
  validateCreateTransaction,
  validateUpdateTransaction,
  validateBatchTransactions
} = require("../validators/transactionValidators");

// Get all transactions for a user
router.get("/user/:userId", transactionController.getAllTransactions);

// Get one transaction
router.get("/:id", transactionController.getTransactionById);

// Create single transaction
router.post("/", validateCreateTransaction, transactionController.createTransaction);

// Create batch transactions
router.post("/batch", validateBatchTransactions, transactionController.createBatchTransactions);

// Update transaction
router.patch("/:id", validateUpdateTransaction, transactionController.updateTransaction);

// Delete transaction
router.delete("/:id", transactionController.deleteTransaction);

module.exports = router;
