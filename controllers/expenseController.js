const Expense = require('../models/Expense');
const { calculateBalances, getSettlements } = require('../utils/settlementUtils');

// Add a new expense
exports.addExpense = async (req, res) => {
  try {
    let { amount, description, paid_by, participants, split_equally, custom_shares_names, custom_shares_amounts } = req.body;

    // Normalize participants
    if (!Array.isArray(participants)) {
      participants = participants ? [participants] : [];
    }
    participants = participants.map(p => p.trim()).filter(Boolean);

    // Basic validation
    if (!description || !paid_by || participants.length === 0 || isNaN(amount) || amount <= 0) {
      return res.status(400).send("Invalid input");
    }

    const totalAmount = parseFloat(amount);
    const paidBy = paid_by.trim();

    let shares = {};

    // Determine splitting method
    if (split_equally || split_equally === 'on') {
      const equalShare = +(totalAmount / participants.length).toFixed(2);
      participants.forEach(p => {
        shares[p] = equalShare;
      });
    } else {
      // Custom share logic
      if (!Array.isArray(custom_shares_names)) {
        custom_shares_names = custom_shares_names ? [custom_shares_names] : [];
      }
      if (!Array.isArray(custom_shares_amounts)) {
        custom_shares_amounts = custom_shares_amounts ? [custom_shares_amounts] : [];
      }

      custom_shares_names.forEach((name, i) => {
        const trimmedName = name.trim();
        const amt = parseFloat(custom_shares_amounts[i]);
        if (trimmedName && !isNaN(amt)) {
          shares[trimmedName] = amt;
        }
      });

      const totalShared = Object.values(shares).reduce((sum, val) => sum + val, 0);
      if (Math.abs(totalShared - totalAmount) > 0.01) {
        return res.status(400).send("Custom shares must sum to total amount");
      }
    }

    // Create new expense
    const expense = new Expense({
      description: description.trim(),
      amount: totalAmount,
      paid_by: paidBy,
      participants,
      shares
    });

    await expense.save();
    res.redirect('/');
  } catch (err) {
    console.error("Error adding expense:", err);
    res.status(500).send("Server error while adding expense");
  }
};

// Get all expenses
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ createdAt: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve expenses" });
  }
};

// Update expense
exports.updateExpense = async (req, res) => {
  try {
    const updated = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Expense not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Invalid update request" });
  }
};

// Delete an expense
exports.deleteExpense = async (req, res) => {
  try {
    const deleted = await Expense.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Expense not found" });
    res.redirect('/');
  } catch (err) {
    res.status(500).send("Failed to delete expense");
  }
};

// Get all people involved
exports.getPeople = async (req, res) => {
  try {
    const expenses = await Expense.find();
    const people = [...new Set(expenses.flatMap(e => [e.paid_by, ...e.participants]))];
    res.json(people);
  } catch (err) {
    res.status(500).send("Error fetching people");
  }
};

// Get balances
exports.getBalances = async (req, res) => {
  try {
    const expenses = await Expense.find();
    const balances = calculateBalances(expenses);
    res.json(balances);
  } catch (err) {
    res.status(500).send("Error calculating balances");
  }
};

// Get settlements
exports.getSettlements = async (req, res) => {
  try {
    const expenses = await Expense.find();
    const balances = calculateBalances(expenses);
    const settlements = getSettlements(balances);
    res.json(settlements);
  } catch (err) {
    res.status(500).send("Error calculating settlements");
  }
};
