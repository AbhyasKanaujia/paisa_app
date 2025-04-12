const express = require('express');
const router = express.Router();
const {
    addIncome,
    addExpense,
    getSummary,
    getTransactions
} = require('../controllers/budgetController');

router.post('/income', addIncome);
router.post('/expense', addExpense);
router.get('/summary', getSummary);
router.get('/transactions', getTransactions);

module.exports = router;
