const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { calculateBalances, getSettlements } = require('../utils/settlementUtils');

// GET all expenses
router.get('/expenses', async (req, res) => {
  const expenses = await Expense.find();
  res.json(expenses);
});

// POST new expense
router.post('/expenses', async (req, res) => {
  try {
    const { description, amount, paid_by, participants } = req.body;

    const cleanedParticipants = participants
      .map(p => p.trim())
      .filter(p => p.length > 0);

    if (!description || !paid_by || cleanedParticipants.length === 0 || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid expense data.' });
    }

    const expense = await Expense.create({
      description: description.trim(),
      amount: parseFloat(amount),
      paid_by: paid_by.trim(),
      participants: cleanedParticipants
    });

    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE expense by ID
router.delete('/expenses/:id', async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(404).json({ success: false, message: "Expense not found" });
  }
});

// GET unique people
router.get('/people', async (req, res) => {
  const expenses = await Expense.find();
  const people = [...new Set(expenses.flatMap(e => [e.paid_by, ...e.participants]))];
  res.json(people);
});

// GET balances
router.get('/balances', async (req, res) => {
  const expenses = await Expense.find();
  const balances = calculateBalances(expenses);
  res.json(balances);
});

// GET settlement summary
router.get('/settlements', async (req, res) => {
  const expenses = await Expense.find();
  const balances = calculateBalances(expenses);
  const settlements = getSettlements(balances);
  res.json(settlements);
});

module.exports = router;