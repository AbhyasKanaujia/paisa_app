const Account = require("../models/Account");

// GET /api/accounts/user/:userId
exports.getAccountsByUser = async (req, res) => {
  try {
    const accounts = await Account.find({ user_id: req.params.userId, archived: false });
    res.status(200).json(accounts);
  } catch (error) {
    console.error("Error fetching accounts:", error);
    res.status(500).json({ message: "Failed to fetch accounts" });
  }
};

// POST /api/accounts
exports.createAccount = async (req, res) => {
  try {
    const { user_id, name, type, color } = req.body;
    const newAccount = new Account({ user_id, name, type, color });
    await newAccount.save();
    res.status(201).json(newAccount);
  } catch (error) {
    console.error("Error creating account:", error);
    res.status(400).json({ message: "Failed to create account", error: error.message });
  }
};

// PATCH /api/accounts/:id
exports.updateAccount = async (req, res) => {
  try {
    const updates = req.body;
    const account = await Account.findByIdAndUpdate(req.params.id, updates, { new: true });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.status(200).json(account);
  } catch (error) {
    console.error("Error updating account:", error);
    res.status(400).json({ message: "Failed to update account", error: error.message });
  }
};

// DELETE /api/accounts/:id
exports.deleteAccount = async (req, res) => {
  try {
    const account = await Account.findByIdAndUpdate(req.params.id, { archived: true }, { new: true });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.status(200).json({ message: "Account archived", account });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ message: "Failed to delete account" });
  }
};
