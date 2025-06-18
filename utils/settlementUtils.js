// Calculates net balances per participant (supports equal and custom shares)
function calculateBalances(expenses) {
  const balances = {};
  const activeUsers = new Set();

  for (const expense of expenses) {
    const { amount, paid_by, participants, shares } = expense;

    // Skip if no participants or amount is invalid
    if (!participants || participants.length === 0 || isNaN(amount)) continue;

    activeUsers.add(paid_by);
    participants.forEach(p => activeUsers.add(p));

    // Add full amount to payer
    balances[paid_by] = (balances[paid_by] || 0) + amount;

    // Handle custom or equal shares
    if (shares && typeof shares === 'object' && Object.keys(shares).length > 0) {
      for (const [person, shareAmount] of Object.entries(shares)) {
        const share = parseFloat(shareAmount);
        if (!isNaN(share)) {
          balances[person] = (balances[person] || 0) - share;
        }
      }
    } else {
      const equalShare = amount / participants.length;
      for (const user of participants) {
        balances[user] = (balances[user] || 0) - equalShare;
      }
    }
  }

  // Return only involved users, rounded to 2 decimal places
  const filtered = {};
  for (const user of activeUsers) {
    filtered[user] = Math.round((balances[user] + Number.EPSILON) * 100) / 100;
  }

  return filtered;
}

// Generates optimal settlement transactions between debtors and creditors
function getSettlements(balances) {
  const settlements = [];
  const creditors = [];
  const debtors = [];

  for (const [person, amount] of Object.entries(balances)) {
    if (amount > 0.01) creditors.push({ person, amount });
    else if (amount < -0.01) debtors.push({ person, amount });
  }

  // Sort creditors descending and debtors ascending
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => a.amount - b.amount);

  // Greedy matching
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
