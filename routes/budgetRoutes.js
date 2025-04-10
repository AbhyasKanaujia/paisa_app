const express = require('express');
const router = express.Router();
const {
    addIncome,
    addExpense,
    getSummary
} = require('../controllers/budgetController');

router.post('/income', addIncome);
router.post('/expense', addExpense);
router.get('/summary', getSummary);

module.exports = router;
