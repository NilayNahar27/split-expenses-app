const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');

// POST new expense
router.post('/add-expense', async (req, res) => {
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

    if (!Array.isArray(participants)) {
      participants = participants ? [participants] : [];
    }
    participants = participants.map(p => p.trim()).filter(Boolean);

    if (!description || !paid_by || participants.length === 0 || isNaN(amount) || amount <= 0) {
      return res.redirect('/');
    }

    const totalAmount = parseFloat(amount);
    const paidBy = paid_by.trim();
    let shares = {};

    if (split_equally === 'on') {
      const equalShare = +(totalAmount / participants.length).toFixed(2);
      participants.forEach(p => { shares[p] = equalShare; });

      const sumSoFar = Object.values(shares).reduce((acc, val) => acc + val, 0);
      const diff = +(totalAmount - sumSoFar).toFixed(2);
      shares[participants[participants.length - 1]] += diff;
    } else {
      if (!Array.isArray(custom_shares_names)) custom_shares_names = [custom_shares_names];
      if (!Array.isArray(custom_shares_amounts)) custom_shares_amounts = [custom_shares_amounts];

      custom_shares_names.forEach((name, i) => {
        const trimmed = name.trim();
        const amt = parseFloat(custom_shares_amounts[i]);
        if (trimmed && !isNaN(amt)) {
          shares[trimmed] = +(amt.toFixed(2));
        }
      });

      const sharedTotal = Object.values(shares).reduce((sum, v) => sum + v, 0);
      if (Math.abs(sharedTotal - totalAmount) > 0.01) return res.redirect('/');
    }

    await Expense.create({ description: description.trim(), amount: totalAmount, paid_by: paidBy, participants, shares });
    res.redirect('/');
  } catch (err) {
    console.error("Add expense failed:", err);
    res.redirect('/');
  }
});

// DELETE expense
router.delete('/expenses/:id', async (req, res) => {
  await Expense.findByIdAndDelete(req.params.id);
  res.redirect('/');
});

module.exports = router;
