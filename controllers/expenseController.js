const Expense = require('../models/Expense');
const { calculateBalances, getSettlements } = require('../utils/settlementUtils');

exports.addExpense = async (req, res) => {
  try {
    const { amount, description, paid_by, participants } = req.body;
    if (!amount || !description || !paid_by || !participants?.length) {
      return res.status(400).json({ message: "Invalid input" });
    }
    const expense = new Expense({ amount, description, paid_by, participants });
    await expense.save();
    res.status(201).json({ success: true, data: expense, message: "Expense added" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getExpenses = async (req, res) => {
  const expenses = await Expense.find().sort({ createdAt: -1 });
  res.json(expenses);
};

exports.updateExpense = async (req, res) => {
  try {
    const updated = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Expense not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Invalid update" });
  }
};

exports.deleteExpense = async (req, res) => {
  const deleted = await Expense.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Expense not found" });
  res.json({ message: "Deleted successfully" });
};

exports.getPeople = async (req, res) => {
  const expenses = await Expense.find();
  const people = [...new Set(expenses.flatMap(e => [e.paid_by, ...e.participants]))];
  res.json(people);
};

exports.getBalances = async (req, res) => {
  const expenses = await Expense.find();
  const balances = calculateBalances(expenses);
  res.json(balances);
};

exports.getSettlements = async (req, res) => {
  const expenses = await Expense.find();
  const balances = calculateBalances(expenses);
  const settlements = getSettlements(balances);
  res.json(settlements);
};
