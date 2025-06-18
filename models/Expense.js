const mongoose = require('mongoose');
const { Schema } = mongoose;

const expenseSchema = new Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paid_by: {
    type: String,
    required: true,
    trim: true
  },
  participants: {
    type: [String],
    required: true
  },
  shares: {
    type: Map,
    of: Number,
    default: {}
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Expense', expenseSchema);
