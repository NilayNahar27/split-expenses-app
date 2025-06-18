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

    const cleanedParticipants = participants
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    if (!description || !paid_by || cleanedParticipants.length === 0 || isNaN(amount) || amount <= 0) {
      return res.status(400).send('Invalid expense data.');
    }

    await Expense.create({
      description: description.trim(),
      amount: parseFloat(amount),
      paid_by: paid_by.trim(),
      participants: cleanedParticipants
    });

    res.redirect('/');
  } catch (err) {
    res.status(400).send('Failed to add expense.');
  }
});

module.exports = router;
