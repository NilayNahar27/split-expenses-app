exports.calculateBalances = (expenses) => {
  const balances = {};

  // Initialize balances for all users
  expenses.forEach(expense => {
    if (!balances[expense.paidBy]) balances[expense.paidBy] = 0;
    expense.participants.forEach(participant => {
      if (!balances[participant.user]) balances[participant.user] = 0;
    });
  });

  // Calculate net balance for each user
  expenses.forEach(expense => {
    balances[expense.paidBy] += expense.amount;
    expense.participants.forEach(participant => {
      balances[participant.user] -= participant.share;
    });
  });

  // Generate settlement transactions
  const transactions = [];
  const users = Object.keys(balances);
  
  // Find positive and negative balances
  const creditors = users.filter(u => balances[u] > 0.01);
  const debtors = users.filter(u => balances[u] < -0.01);

  // Create settlement transactions
  for (let creditor of creditors) {
    while (Math.abs(balances[creditor]) > 0.01) {
      for (let debtor of debtors) {
        if (Math.abs(balances[debtor]) < 0.01) continue;
        
        const amount = Math.min(balances[creditor], Math.abs(balances[debtor]));
        if (amount > 0.01) {
          transactions.push({
            from: debtor,
            to: creditor,
            amount: Math.round(amount * 100) / 100
          });
          balances[creditor] -= amount;
          balances[debtor] += amount;
        }
      }
    }
  }

  return transactions;
};