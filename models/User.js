const mongoose = require("mongoose");

const pinnedContextSchema = new mongoose.Schema({
  from_account: { type: String, default: null },
  date: { type: Date, default: null },
  tags: { type: [String], default: [] }
}, { _id: false });

const userSchema = new mongoose.Schema({
  email: { type: String, required: false, unique: true, sparse: true },
  preferences: {
    default_mode: { type: String, enum: ["expense", "income"], default: "expense" },
    pinned_context: { type: pinnedContextSchema, default: {} }
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
