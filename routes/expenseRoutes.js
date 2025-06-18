const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { calculateBalances, getSettlements } = require('../utils/settlementUtils');

// GET all expenses
router.get('/expenses', async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ createdAt: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch expenses.' });
  }
});

// POST new expense (supports equal or custom shares)
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
      // ⚠️ Exclude the payer from being charged their own share
      const participantsWithoutPayer = cleanedParticipants.filter(p => p !== paidBy);

      if (participantsWithoutPayer.length === 0) {
        return res.status(400).send("No one to split with.");
      }

      const equalShare = +(totalAmount / participantsWithoutPayer.length).toFixed(2);
      participantsWithoutPayer.forEach(p => {
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

// DELETE an expense by ID
router.delete('/expenses/:id', async (req, res) => {
  try {
    const deleted = await Expense.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Expense not found.' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete expense.' });
  }
});

// GET all unique people
router.get('/people', async (req, res) => {
  try {
    const expenses = await Expense.find();
    const people = [...new Set(expenses.flatMap(e => [e.paid_by, ...e.participants]))];
    res.json(people);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to get people.' });
  }
});

// GET balances summary
router.get('/balances', async (req, res) => {
  try {
    const expenses = await Expense.find();
    const balances = calculateBalances(expenses);
    res.json(balances);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to get balances.' });
  }
});

// GET settlement suggestions
router.get('/settlements', async (req, res) => {
  try {
    const expenses = await Expense.find();
    const balances = calculateBalances(expenses);
    const settlements = getSettlements(balances);
    res.json(settlements);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to get settlements.' });
  }
});

module.exports = router;
