const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { calculateBalances, getSettlements } = require('../utils/settlementUtils');

// GET all expenses
router.get('/expenses', async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch expenses.' });
  }
});

// POST new expense (equal or custom shares supported)
router.post('/expenses', async (req, res) => {
  try {
    let {
      description,
      amount,
      paid_by,
      participants,
      split_equally,
      custom_shares_names,
      custom_shares_amounts
    } = req.body;

    // Normalize participants
    if (!Array.isArray(participants)) {
      participants = participants ? [participants] : [];
    }
    participants = participants.map(p => p.trim()).filter(Boolean);

    if (!description || !paid_by || participants.length === 0 || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid input data.' });
    }

    const totalAmount = parseFloat(amount);
    const paidBy = paid_by.trim();
    let shares = {};

    if (split_equally === 'on' || split_equally === true) {
      // Equal split
      const equalShare = +(totalAmount / participants.length).toFixed(2);
      participants.forEach(p => {
        shares[p] = equalShare;
      });
    } else {
      // Custom shares
      if (!Array.isArray(custom_shares_names)) {
        custom_shares_names = custom_shares_names ? [custom_shares_names] : [];
      }
      if (!Array.isArray(custom_shares_amounts)) {
        custom_shares_amounts = custom_shares_amounts ? [custom_shares_amounts] : [];
      }

      custom_shares_names.forEach((name, i) => {
        const trimmed = name.trim();
        const amt = parseFloat(custom_shares_amounts[i]);
        if (trimmed && !isNaN(amt)) {
          shares[trimmed] = amt;
        }
      });

      const sharedTotal = Object.values(shares).reduce((sum, v) => sum + v, 0);
      if (Math.abs(sharedTotal - totalAmount) > 0.01) {
        return res.status(400).json({ success: false, message: 'Custom shares must sum to total amount.' });
      }
    }

    const expense = await Expense.create({
      description: description.trim(),
      amount: totalAmount,
      paid_by: paidBy,
      participants,
      shares
    });

    res.status(201).json({ success: true, data: expense });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create expense.' });
  }
});

// DELETE an expense by ID
router.delete('/expenses/:id', async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(404).json({ success: false, message: 'Expense not found.' });
  }
});

// GET list of all people
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
