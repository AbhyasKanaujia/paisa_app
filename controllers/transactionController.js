const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");

// GET /api/transactions/user/:userId
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user_id: req.params.userId }).sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
};

// GET /api/transactions/:id
exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.status(200).json(transaction);
  } catch (error) {
    console.error("Error fetching transaction:", error);
    res.status(500).json({ message: "Failed to fetch transaction" });
  }
};

// POST /api/transactions
exports.createTransaction = async (req, res) => {
  try {
    const { user_id, type, amount, description, vendor, from_account, date, tags, raw_input, batch_id } = req.body;

    if (!user_id || !type || !amount || !date || !raw_input) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const transaction = new Transaction({
      user_id,
      type,
      amount,
      description,
      vendor,
      from_account,
      date,
      tags,
      raw_input,
      batch_id: batch_id || null
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(400).json({ message: "Failed to create transaction", error: error.message });
  }
};

// POST /api/transactions/batch
exports.createBatchTransactions = async (req, res) => {
  try {
    const { user_id, transactions } = req.body;

    if (!user_id || !Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({ message: "Invalid batch input" });
    }

    const prepared = transactions.map(t => ({
      user_id,
      type: t.type,
      amount: t.amount,
      description: t.description,
      vendor: t.vendor,
      from_account: t.from_account,
      date: t.date,
      tags: t.tags || [],
      raw_input: t.raw_input,
      batch_id: t.batch_id || null
    }));

    const result = await Transaction.insertMany(prepared);
    res.status(201).json({ message: `${result.length} transactions added`, transactions: result });
  } catch (error) {
    console.error("Error batch-creating transactions:", error);
    res.status(400).json({ message: "Failed to batch-create transactions", error: error.message });
  }
};

// PATCH /api/transactions/:id
exports.updateTransaction = async (req, res) => {
  try {
    const updates = req.body;
    const transaction = await Transaction.findByIdAndUpdate(req.params.id, updates, { new: true });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json(transaction);
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(400).json({ message: "Failed to update transaction", error: error.message });
  }
};

// DELETE /api/transactions/:id
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json({ message: "Transaction deleted", transaction });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ message: "Failed to delete transaction" });
  }
};
