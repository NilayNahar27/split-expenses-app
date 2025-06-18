const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { calculateBalances, getSettlements } = require('../utils/settlementUtils');

// Home route - Render index page with full data
router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ createdAt: -1 });
    const people = [...new Set(expenses.flatMap(e => [e.paid_by, ...e.participants]))];
    const balances = calculateBalances(expenses);
    const settlements = getSettlements(balances);

    res.render('index', {
      expenses,
      people,
      balances,
      settlements
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to load dashboard');
  }
});

// Add expense from form (equal or custom shares)
router.post('/add-expense', async (req, res) => {
  try {
    const { description, amount, paid_by, split_equally } = req.body;
    let { participants, custom_shares_names, custom_shares_amounts } = req.body;

    // Normalize participants
    if (!Array.isArray(participants)) {
      participants = participants ? [participants] : [];
    }
    const cleanedParticipants = participants.map(p => p.trim()).filter(Boolean);

    if (!description || !paid_by || cleanedParticipants.length === 0 || isNaN(amount) || amount <= 0) {
      return res.status(400).send('Invalid expense data.');
    }

    const totalAmount = parseFloat(amount);
    const paidBy = paid_by.trim();
    let shares = {};

    if (split_equally === 'on' || split_equally === true) {
      const equalShare = +(totalAmount / cleanedParticipants.length).toFixed(2);
      cleanedParticipants.forEach(p => {
        shares[p] = equalShare;
      });
    } else {
      // Normalize custom shares input
      if (!Array.isArray(custom_shares_names)) {
        custom_shares_names = custom_shares_names ? [custom_shares_names] : [];
      }
      if (!Array.isArray(custom_shares_amounts)) {
        custom_shares_amounts = custom_shares_amounts ? [custom_shares_amounts] : [];
      }

      custom_shares_names.forEach((name, i) => {
        const user = name.trim();
        const value = parseFloat(custom_shares_amounts[i]);
        if (user && !isNaN(value)) {
          shares[user] = value;
        }
      });

      const sharedSum = Object.values(shares).reduce((sum, v) => sum + v, 0);
      if (Math.abs(sharedSum - totalAmount) > 0.01) {
        return res.status(400).send('Custom shares must sum to total amount.');
      }
    }

    const expenseData = {
      description: description.trim(),
      amount: totalAmount,
      paid_by: paidBy,
      participants: cleanedParticipants,
      shares
    };

    await Expense.create(expenseData);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to add expense.');
  }
});

module.exports = router;
