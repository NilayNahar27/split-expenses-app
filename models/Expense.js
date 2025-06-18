const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [1, 'Description cannot be empty']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be positive']
  },
  paidBy: {
    type: String,
    required: [true, 'Payer is required'],
    trim: true,
    minlength: [1, 'Payer name cannot be empty']
  },
  participants: [{
    user: {
      type: String,
      required: [true, 'Participant name is required'],
      trim: true,
      minlength: [1, 'Participant name cannot be empty']
    },
    share: {
      type: Number,
      required: [true, 'Participant share is required'],
      min: [0, 'Share cannot be negative']
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to validate and sanitize data
expenseSchema.pre('save', function(next) {
  if (!this.participants || this.participants.length === 0) {
    return next(new Error('At least one participant is required'));
  }

  this.participants.forEach(participant => {
    if (typeof participant.share !== 'number' || isNaN(participant.share) || participant.share < 0) {
      return next(new Error(`Invalid share for participant ${participant.user}`));
    }
  });

  const totalShares = this.participants.reduce((sum, p) => sum + p.share, 0);
  if (Math.abs(totalShares - this.amount) > 0.01) {
    return next(new Error('Total participant shares must equal the expense amount'));
  }

  next();
});

// Index for efficient querying
expenseSchema.index({ paidBy: 1 });
expenseSchema.index({ 'participants.user': 1 });

module.exports = mongoose.model('Expense', expenseSchema);