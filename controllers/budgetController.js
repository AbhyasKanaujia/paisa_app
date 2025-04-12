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

// Transactions
exports.getTransactions = async (req, res) => {
    try {
        const {
            type,
            minAmount,
            maxAmount,
            startDate,
            endDate,
            search,
            page = 1,
            limit = 10
        } = req.query;

        const incomeQuery = {};
        const expenseQuery = {};

        if (minAmount) {
            incomeQuery.amount = { ...incomeQuery.amount, $gte: parseFloat(minAmount) };
            expenseQuery.amount = { ...expenseQuery.amount, $gte: parseFloat(minAmount) };
        }
        if (maxAmount) {
            incomeQuery.amount = { ...incomeQuery.amount, $lte: parseFloat(maxAmount) };
            expenseQuery.amount = { ...expenseQuery.amount, $lte: parseFloat(maxAmount) };
        }

        if (startDate) {
            const date = new Date(startDate);
            incomeQuery.date = { ...incomeQuery.date, $gte: date };
            expenseQuery.date = { ...expenseQuery.date, $gte: date };
        }

        if (endDate) {
            const date = new Date(endDate);
            incomeQuery.date = { ...incomeQuery.date, $lte: date };
            expenseQuery.date = { ...expenseQuery.date, $lte: date };
        }

        if (search) {
            incomeQuery.note = { $regex: search, $options: 'i' };
            expenseQuery.note = { $regex: search, $options: 'i' };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        let results = [];
        let total = 0;

        if (type === 'income') {
            total = await Income.countDocuments(incomeQuery);
            const incomes = await Income.find(incomeQuery)
                .sort({ date: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean();
            results = incomes.map(item => ({ ...item, type: 'income' }));
        } else if (type === 'expense') {
            total = await Expense.countDocuments(expenseQuery);
            const expenses = await Expense.find(expenseQuery)
                .sort({ date: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean();
            results = expenses.map(item => ({ ...item, type: 'expense' }));
        } else {
            const [incomes, expenses, incomeTotal, expenseTotal] = await Promise.all([
                Income.find(incomeQuery).sort({ date: -1 }).lean(),
                Expense.find(expenseQuery).sort({ date: -1 }).lean(),
                Income.countDocuments(incomeQuery),
                Expense.countDocuments(expenseQuery)
            ]);

            total = incomeTotal + expenseTotal;

            results = [...incomes.map(i => ({ ...i, type: 'income' })), ...expenses.map(e => ({ ...e, type: 'expense' }))];
            results.sort((a, b) => new Date(b.date) - new Date(a.date));
            results = results.slice(skip, skip + parseInt(limit));
        }

        const pages = Math.ceil(total / parseInt(limit));

        res.json({
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages,
            data: results
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

