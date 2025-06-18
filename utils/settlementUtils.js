// Calculates net balances per participant (supports equal and custom shares)
function calculateBalances(expenses) {
  const balances = {};

  for (const expense of expenses) {
    const { amount, paid_by, shares } = expense;

    // 1. Add the total amount to the person who paid
    balances[paid_by] = (balances[paid_by] || 0) + amount;

    // 2. Subtract each participant's share from their balance
    if (shares && typeof shares === 'object') {
      for (const [participant, shareAmount] of Object.entries(shares)) {
        balances[participant] = (balances[participant] || 0) - shareAmount;
      }
    }
  }

  // Round to 2 decimal places
  for (let person in balances) {
    balances[person] = Math.round((balances[person] + Number.EPSILON) * 100) / 100;
  }

  return balances;
}


// Generates optimal settlement transactions between debtors and creditors
function getSettlements(balances) {
  const creditors = [];
  const debtors = [];

  for (const [person, amount] of Object.entries(balances)) {
    if (amount > 0.01) creditors.push({ person, amount });
    else if (amount < -0.01) debtors.push({ person, amount });
  }

  // Sort to optimize settlements
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => a.amount - b.amount);

  const settlements = [];

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
