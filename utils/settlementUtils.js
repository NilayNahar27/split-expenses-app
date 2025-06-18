// Calculate net balances per participant (supports equal and custom shares)
function calculateBalances(expenses) {
  const balances = {};

  for (const expense of expenses) {
    const { amount, paid_by, shares } = expense;

    // Credit the person who paid
    balances[paid_by] = (balances[paid_by] || 0) + amount;

    // Debit each participant based on their share
    if (shares && typeof shares === 'object') {
      for (const [participant, shareAmount] of Object.entries(shares)) {
        balances[participant] = (balances[participant] || 0) - shareAmount;
      }
    }
  }

  // Normalize floating point errors (e.g., 33.333... or -66.666...)
  for (const person in balances) {
    balances[person] = Math.round((balances[person] + Number.EPSILON) * 100) / 100;
  }

  return balances;
}

// Generate minimal settlements between debtors and creditors
function getSettlements(balances) {
  const creditors = [];
  const debtors = [];

  // Separate creditors and debtors
  for (const [person, balance] of Object.entries(balances)) {
    if (balance > 0.01) {
      creditors.push({ person, amount: balance });
    } else if (balance < -0.01) {
      debtors.push({ person, amount: balance });
    }
  }

  // Sort for optimal matching
  creditors.sort((a, b) => b.amount - a.amount); // Descending
  debtors.sort((a, b) => a.amount - b.amount);   // Ascending (more negative first)

  const settlements = [];

  while (creditors.length && debtors.length) {
    const creditor = creditors[0];
    const debtor = debtors[0];
    const amountToSettle = Math.min(creditor.amount, -debtor.amount);

    settlements.push({
      from: debtor.person,
      to: creditor.person,
      amount: Math.round((amountToSettle + Number.EPSILON) * 100) / 100
    });

    // Update balances
    creditor.amount -= amountToSettle;
    debtor.amount += amountToSettle;

    // Remove fully settled entries
    if (creditor.amount <= 0.01) creditors.shift();
    if (debtor.amount >= -0.01) debtors.shift();
  }

  return settlements;
}

module.exports = {
  calculateBalances,
  getSettlements
};
