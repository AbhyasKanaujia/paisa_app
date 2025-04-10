const Income = require('../models/Income');
const Expense = require('../models/Expense');

// Income
exports.addIncome = async (req, res) => {
    try {
        const income = await Income.create(req.body);
        res.status(201).json(income);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Expense
exports.addExpense = async (req, res) => {
    try {
        const expense = await Expense.create(req.body);
        res.status(201).json(expense);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Summary
exports.getSummary = async (req, res) => {
    try {
        const incomes = await Income.find();
        const expenses = await Expense.find();

        const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
        const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
        const balance = totalIncome - totalExpense;

        res.json({ totalIncome, totalExpense, balance });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
