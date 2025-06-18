const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { calculateBalances } = require('../utils/settlementUtils');

router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find().lean();
    const balances = calculateBalances(expenses);
    res.render('index', { expenses: expenses || [], balances: balances || [] });
  } catch (error) {
    console.error('Error rendering page:', error);
    res.status(500).render('index', { 
      expenses: [], 
      balances: [], 
      error: 'Failed to load expenses. Please try again later.' 
    });
  }
});

module.exports = router;