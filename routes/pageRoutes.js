const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { calculateBalances } = require('../utils/settlementUtils');

router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find();
    const balances = calculateBalances(expenses);
    res.render('index', { expenses, balances });
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;