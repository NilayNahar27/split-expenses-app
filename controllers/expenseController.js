const Expense = require('../models/Expense');
const { calculateBalances } = require('../utils/settlementUtils');

exports.addExpense = async (req, res) => {
  try {
    const { description, amount, paidBy, participants } = req.body;

    // Input validation
    if (!description || typeof description !== 'string' || description.trim() === '') {
      return res.status(400).json({ error: 'Description is required and must be a non-empty string' });
    }
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Amount is required and must be a positive number' });
    }
    if (!paidBy || typeof paidBy !== 'string' || paidBy.trim() === '') {
      return res.status(400).json({ error: 'Payer is required and must be a non-empty string' });
    }
    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({ error: 'At least one participant is required' });
    }
    if (participants.some(p => !p.user || typeof p.user !== 'string' || p.user.trim() === '')) {
      return res.status(400).json({ error: 'All participants must have valid, non-empty user names' });
    }

    // Calculate share for each participant
    const share = amount / participants.length;

    const expense = new Expense({
      description: description.trim(),
      amount: parseFloat(amount.toFixed(2)),
      paidBy: paidBy.trim(),
      participants: participants.map(p => ({
        user: p.user.trim(),
        share: parseFloat(share.toFixed(2))
      }))
    });

    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    console.error('Error adding expense:', {
      error: error.message,
      requestBody: req.body
    });
    res.status(500).json({ error: 'Failed to add expense: ' + error.message });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().lean();
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses: ' + error.message });
  }
};

exports.getBalances = async (req, res) => {
  try {
    const expenses = await Expense.find().lean();
    const balances = calculateBalances(expenses);
    res.json(balances);
  } catch (error) {
    console.error('Error calculating balances:', error);
    res.status(500).json({ error: 'Failed to calculate balances: ' + error.message });
  }
};