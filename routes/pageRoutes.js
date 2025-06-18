const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { calculateBalances, getSettlements } = require('../utils/settlementUtils');

router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ createdAt: -1 });
    const people = [...new Set(expenses.flatMap(e => [e.paid_by, ...e.participants]))];
    const balances = calculateBalances(expenses);
    const settlements = getSettlements(balances);

    res.render('index', { expenses, people, balances, settlements });
  } catch (err) {
    console.error("Rendering failed:", err);
    res.status(500).send("Something went wrong.");
  }
});

module.exports = router;
