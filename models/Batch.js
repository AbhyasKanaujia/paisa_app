const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  entry_count: { type: Number, required: true },
  pinned_context: {
    from_account: { type: String },
    date: { type: Date },
    tags: { type: [String], default: [] }
  },
  raw_inputs: { type: [String], required: true }
}, { timestamps: true });

module.exports = mongoose.model("Batch", batchSchema);
