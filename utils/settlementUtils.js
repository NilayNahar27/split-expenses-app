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

module.exports = {
  calculateBalances,
  // getSettlements
};
