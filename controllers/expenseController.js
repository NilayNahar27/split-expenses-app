const Expense = require('../models/Expense');
const { calculateBalances, getSettlements } = require('../utils/settlementUtils');

// Add a new expense
exports.addExpense = async (req, res) => {
  try {
    let { amount, description, paid_by, participants } = req.body;

    // Normalize participants (checkboxes return string if only one selected)
    if (!Array.isArray(participants)) {
      participants = [participants];
    }

    // Basic validation
    if (
      !description ||
      !paid_by ||
      !Array.isArray(participants) ||
      participants.length === 0 ||
      isNaN(amount) ||
      amount <= 0
    ) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const expense = new Expense({
      amount: parseFloat(amount),
      description: description.trim(),
      paid_by: paid_by.trim(),
      participants: participants.map(p => p.trim())
    });

    await expense.save();
    res.status(201).json({ success: true, data: expense, message: "Expense added" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all expenses
exports.getExpenses = async (req, res) => {
  const expenses = await Expense.find().sort({ createdAt: -1 });
  res.json(expenses);
};

// Update an expense by ID
exports.updateExpense = async (req, res) => {
  try {
    const updated = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Expense not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Invalid update" });
  }
};

// Delete an expense by ID
exports.deleteExpense = async (req, res) => {
  const deleted = await Expense.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Expense not found" });
  res.json({ message: "Deleted successfully" });
};

// Get unique people involved
exports.getPeople = async (req, res) => {
  const expenses = await Expense.find();
  const people = [...new Set(expenses.flatMap(e => [e.paid_by, ...e.participants]))];
  res.json(people);
};

// Get balances
exports.getBalances = async (req, res) => {
  const expenses = await Expense.find();
  const balances = calculateBalances(expenses);
  res.json(balances);
};

// Get settlements
exports.getSettlements = async (req, res) => {
  const expenses = await Expense.find();
  const balances = calculateBalances(expenses);
  const settlements = getSettlements(balances);
  res.json(settlements);
};
