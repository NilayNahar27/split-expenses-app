const Expense = require('../models/Expense');
const { calculateBalances } = require('../utils/settlementUtils');

exports.addExpense = async (req, res) => {
  try {
    const { description, amount, paidBy, participants } = req.body;
    const expense = new Expense({
      description,
      amount,
      paidBy,
      participants: participants.map(p => ({
        user: p.user,
        share: amount / participants.length
      }))
    });
    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBalances = async (req, res) => {
  try {
    const expenses = await Expense.find();
    const balances = calculateBalances(expenses);
    res.json(balances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};