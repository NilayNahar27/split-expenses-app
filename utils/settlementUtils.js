function calculateBalances(expenses) {
  const balances = {};

  expenses.forEach(exp => {
    const paidBy = exp.paid_by;
    const shares = exp.shares || {};

    // Paid amount gets credited
    balances[paidBy] = (balances[paidBy] || 0) + exp.amount;

    // Each participant owes their share (debited)
    for (const [person, amount] of Object.entries(shares)) {
      balances[person] = (balances[person] || 0) - amount;
    }
  });

  return balances;
}

function getSettlements(balances) {
  const creditors = [];
  const debtors = [];

  for (const [person, balance] of Object.entries(balances)) {
    const rounded = +balance.toFixed(2);
    if (rounded > 0) creditors.push({ person, amount: rounded });
    else if (rounded < 0) debtors.push({ person, amount: -rounded });
  }

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const settlements = [];

  for (let d of debtors) {
    for (let c of creditors) {
      if (d.amount === 0) break;
      const min = Math.min(d.amount, c.amount);

      if (min > 0) {
        settlements.push({ from: d.person, to: c.person, amount: +min.toFixed(2) });
        d.amount -= min;
        c.amount -= min;
      }
    }
  }

  return settlements;
}

module.exports = { calculateBalances, getSettlements };
