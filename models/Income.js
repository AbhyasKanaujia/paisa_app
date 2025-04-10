const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    source: { type: String },
    date: { type: Date, default: Date.now },
    note: { type: String }
});

module.exports = mongoose.model('Income', incomeSchema);
