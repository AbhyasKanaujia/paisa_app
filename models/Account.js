const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ["bank", "cash", "wallet"], required: true },
  color: { type: String, default: "#cccccc" },
  archived: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Account", accountSchema);
