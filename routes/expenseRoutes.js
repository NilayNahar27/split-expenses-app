const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { calculateBalances, getSettlements } = require('../utils/settlementUtils');

router.get('/expenses', async (req, res) => {
  const expenses = await Expense.find();
  res.json(expenses);
});

router.post('/expenses', async (req, res) => {
  const expense = await Expense.create(req.body);
  res.status(201).json({ success: true, data: expense });
});

router.delete('/expenses/:id', async (req, res) => {
  const { id } = req.params;
  await Expense.findByIdAndDelete(id);
  res.json({ success: true });
});

router.get('/people', async (req, res) => {
  const expenses = await Expense.find();
  const people = [...new Set(expenses.flatMap(e => [e.paid_by, ...e.participants]))];
  res.json(people);
});

router.get('/balances', async (req, res) => {
  const expenses = await Expense.find();
  const balances = calculateBalances(expenses);
  res.json(balances);
});

router.get('/settlements', async (req, res) => {
  const expenses = await Expense.find();
  const balances = calculateBalances(expenses);
  const settlements = getSettlements(balances);
  res.json(settlements);
});

module.exports = router;
