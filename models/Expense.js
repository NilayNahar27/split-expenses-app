const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  description: String,
  amount: Number,
  paid_by: String,
  participants: [String],
  shares: {
    type: Map,
    of: Number
  }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
