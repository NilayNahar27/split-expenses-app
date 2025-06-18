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
    const { description, amount, paid_by } = req.body;
    let { participants, shares } = req.body;

    // Normalize participants (can be string or array)
    if (!Array.isArray(participants)) {
      participants = [participants];
    }

    // Normalize and parse shares
    let shareMap = new Map();
    let totalShareSum = 0;

    if (shares && typeof shares === 'object') {
      for (const user of participants) {
        const raw = shares[user] || shares[user.trim()];
        const value = parseFloat(raw);
        if (!isNaN(value) && value >= 0) {
          shareMap.set(user.trim(), value);
          totalShareSum += value;
        }
      }
    }

    const cleanedParticipants = participants.map(p => p.trim()).filter(p => p.length > 0);

    if (!description || !paid_by || cleanedParticipants.length === 0 || isNaN(amount) || amount <= 0) {
      return res.status(400).send('Invalid expense data.');
    }

    const expenseData = {
      description: description.trim(),
      amount: parseFloat(amount),
      paid_by: paid_by.trim(),
      participants: cleanedParticipants
    };

    // Only include shares if valid and non-zero
    if (shareMap.size > 0 && totalShareSum > 0) {
      expenseData.shares = Object.fromEntries(shareMap);
    }

    await Expense.create(expenseData);

    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(400).send('Failed to add expense.');
  }
});

module.exports = router;
