const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["expense", "income"], required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  vendor: { type: String }, // Parsed from @
  from_account: { type: String },
  date: { type: Date, required: true },
  tags: { type: [String], default: [] },
  raw_input: { type: String, required: true },
  batch_id: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", default: null }
}, { timestamps: true });

module.exports = mongoose.model("Transaction", transactionSchema);
