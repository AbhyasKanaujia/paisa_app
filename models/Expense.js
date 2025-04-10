const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    category: { type: String },
    date: { type: Date, default: Date.now },
    note: { type: String }
});

module.exports = mongoose.model('Expense', expenseSchema);
