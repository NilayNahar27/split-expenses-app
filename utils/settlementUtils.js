exports.calculateBalances = (expenses) => {
  const balances = {};
  expenses.forEach(({ amount, paid_by, participants }) => {
    const share = amount / participants.length;
    participants.forEach(p => {
      balances[p] = (balances[p] || 0) - share;
    });
    balances[paid_by] = (balances[paid_by] || 0) + amount;
  });
  return balances;
};

exports.getSettlements = (balances) => {
  const debtors = [];
  const creditors = [];

  Object.entries(balances).forEach(([name, bal]) => {
    if (bal < -0.01) debtors.push({ name, amount: bal });
    else if (bal > 0.01) creditors.push({ name, amount: bal });
  });

  debtors.sort((a, b) => a.amount - b.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const settlements = [];
  let i = 0, j = 0;

  while (i < debtors.length && j < creditors.length) {
    const min = Math.min(-debtors[i].amount, creditors[j].amount);
    settlements.push({ from: debtors[i].name, to: creditors[j].name, amount: parseFloat(min.toFixed(2)) });

    debtors[i].amount += min;
    creditors[j].amount -= min;

    if (Math.abs(debtors[i].amount) < 0.01) i++;
    if (Math.abs(creditors[j].amount) < 0.01) j++;
  }

  return settlements;
};
