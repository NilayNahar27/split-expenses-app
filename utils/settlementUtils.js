exports.calculateBalances = (expenses) => {
  const balances = {};

  if (!Array.isArray(expenses)) {
    console.warn('calculateBalances: Invalid expenses input, expected array');
    return [];
  }

  expenses.forEach((expense, index) => {
    if (!expense || typeof expense !== 'object' || !expense.paidBy || !expense.amount || !Array.isArray(expense.participants)) {
      console.warn(`calculateBalances: Skipping invalid expense at index ${index}`, expense);
      return;
    }

    if (!balances[expense.paidBy]) {
      balances[expense.paidBy] = 0;
    }

    expense.participants.forEach((participant, pIndex) => {
      if (!participant || !participant.user || typeof participant.share !== 'number' || isNaN(participant.share)) {
        console.warn(`calculateBalances: Skipping invalid participant at expense index ${index}, participant index ${pIndex}`, participant);
        return;
      }
      if (!balances[participant.user]) {
        balances[participant.user] = 0;
      }
    });
  });

  expenses.forEach((expense, index) => {
    if (!expense || typeof expense !== 'object' || !expense.paidBy || !expense.amount || !Array.isArray(expense.participants)) {
      return;
    }

    if (typeof expense.amount === 'number' && !isNaN(expense.amount)) {
      balances[expense.paidBy] += parseFloat(expense.amount.toFixed(2));
    }

    expense.participants.forEach((participant, pIndex) => {
      if (!participant || !participant.user || typeof participant.share !== 'number' || isNaN(participant.share)) {
        return;
      }
      balances[participant.user] -= parseFloat(participant.share.toFixed(2));
    });
  });

  const transactions = [];
  const users = Object.keys(balances);
  const creditors = users.filter(u => balances[u] > 0.01);
  const debtors = users.filter(u => balances[u] < -0.01);

  for (let creditor of creditors) {
    while (Math.abs(balances[creditor]) > 0.01) {
      for (let debtor of debtors) {
        if (Math.abs(balances[debtor]) < 0.01) continue;

        const amount = Math.min(balances[creditor], Math.abs(balances[debtor]));
        if (amount > 0.01) {
          transactions.push({
            from: debtor,
            to: creditor,
            amount: parseFloat(amount.toFixed(2))
          });
          balances[creditor] -= amount;
          balances[debtor] += amount;
        }
      }
    }
  }

  return transactions;
};