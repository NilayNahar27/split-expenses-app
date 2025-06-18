const Expense = require('../models/Expense');
const { calculateBalances, getSettlements } = require('../utils/settlementUtils');

// Add a new expense
exports.addExpense = async (req, res) => {
  try {
    let {
      amount,
      description,
      paid_by,
      participants,
      split_equally,
      custom_shares_names,
      custom_shares_amounts
    } = req.body;

    // Normalize participants to array
    if (!Array.isArray(participants)) {
      participants = participants ? [participants] : [];
    }
    participants = participants.map(p => p.trim()).filter(Boolean);

    // Basic validations
    if (!description || !paid_by || participants.length === 0 || isNaN(amount) || amount <= 0) {
      return res.status(400).send("Invalid input: All fields are required and amount must be positive.");
    }

    const totalAmount = parseFloat(amount);
    const paidBy = paid_by.trim();
    const shares = {};

    // Split equally if flag is set or checked
    if (split_equally === 'on' || split_equally === true) {
      const equalShare = parseFloat((totalAmount / participants.length).toFixed(2));
      participants.forEach(p => {
        shares[p] = equalShare;
      });

      // Fix for rounding mismatch
      const totalShared = Object.values(shares).reduce((sum, val) => sum + val, 0);
      const correction = +(totalAmount - totalShared).toFixed(2);
      if (Math.abs(correction) > 0.01) {
        shares[participants[0]] += correction; // Adjust first participant
      }

    } else {
      // Custom shares mode
      if (!Array.isArray(custom_shares_names)) {
        custom_shares_names = custom_shares_names ? [custom_shares_names] : [];
      }
      if (!Array.isArray(custom_shares_amounts)) {
        custom_shares_amounts = custom_shares_amounts ? [custom_shares_amounts] : [];
      }

      custom_shares_names.forEach((name, idx) => {
        const trimmed = name.trim();
        const shareAmt = parseFloat(custom_shares_amounts[idx]);
        if (trimmed && !isNaN(shareAmt) && shareAmt >= 0) {
          shares[trimmed] = shareAmt;
        }
      });

      const totalShared = Object.values(shares).reduce((sum, val) => sum + val, 0);
      if (Math.abs(totalShared - totalAmount) > 0.01) {
        return res.status(400).send("Custom shares must sum to the total amount");
      }
    }

    // Save to DB
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
