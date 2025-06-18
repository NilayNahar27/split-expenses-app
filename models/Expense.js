const mongoose = require('mongoose');
const { Schema } = mongoose;

const expenseSchema = new Schema({
  description: String,
  amount: Number,
  paid_by: String,
  participants: [String]
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
