const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { calculateBalances, getSettlements } = require('../utils/settlementUtils');

router.get('/', async (req, res) => {
  const expenses = await Expense.find();
  const people = [...new Set(expenses.flatMap(e => [e.paid_by, ...e.participants]))];
  const balances = calculateBalances(expenses);
  const settlements = getSettlements(balances);

  res.render('index', { expenses, people, balances, settlements });
});

router.post('/add-expense', async (req, res) => {
  const { description, amount, paid_by, participants } = req.body;
  await Expense.create({
    description,
    amount,
    paid_by,
    participants: participants.split(',').map(p => p.trim())
  });
  res.redirect('/');
});

module.exports = router;
