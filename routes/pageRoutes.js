const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { calculateBalances, getSettlements } = require('../utils/settlementUtils');

// Render the home page with all data
router.get('/', async (req, res) => {
  const expenses = await Expense.find();
  const people = [...new Set(expenses.flatMap(e => [e.paid_by, ...e.participants]))];
  const balances = calculateBalances(expenses);
  const settlements = getSettlements(balances);

  res.render('index', {
    expenses,
    people,
    balances,
    settlements
  });
});

// Handle form-based addition
router.post('/add-expense', async (req, res) => {
  try {
    const { description, amount, paid_by, participants } = req.body;
    await Expense.create({
      description,
      amount,
      paid_by,
      participants: participants.split(',').map(p => p.trim())
    });
    res.redirect('/');
  } catch (err) {
    res.status(400).send('Failed to add expense.');
  }
});

module.exports = router;
