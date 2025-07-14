const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  color: { type: String, default: "#888888" },
  archived: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Tag", tagSchema);
