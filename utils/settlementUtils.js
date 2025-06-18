function calculateBalances(expenses) {
  const balances = {};
  const activeUsers = new Set();

  for (const expense of expenses) {
    const { amount, paid_by, participants } = expense;
    const share = amount / participants.length;

    // Track involved users
    activeUsers.add(paid_by);
    participants.forEach(p => activeUsers.add(p));

    // Update payer
    balances[paid_by] = (balances[paid_by] || 0) + amount;

    // Update participants
    for (const user of participants) {
      balances[user] = (balances[user] || 0) - share;
    }
  }

  // Filter out users who were not involved
  const filtered = {};
  for (const user of activeUsers) {
    filtered[user] = balances[user];
  }

  return filtered;
}

function getSettlements(balances) {
  const settlements = [];
  const creditors = [];
  const debtors = [];

  for (const [person, amount] of Object.entries(balances)) {
    if (amount > 0.01) creditors.push({ person, amount });
    else if (amount < -0.01) debtors.push({ person, amount });
  }

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => a.amount - b.amount);

  while (creditors.length && debtors.length) {
    const creditor = creditors[0];
    const debtor = debtors[0];
    const amount = Math.min(creditor.amount, -debtor.amount);

    settlements.push({
      from: debtor.person,
      to: creditor.person,
      amount: Math.round(amount * 100) / 100
    });

    creditor.amount -= amount;
    debtor.amount += amount;

    if (creditor.amount < 0.01) creditors.shift();
    if (debtor.amount > -0.01) debtors.shift();
  }

  return settlements;
}

module.exports = {
  calculateBalances,
  getSettlements
};
