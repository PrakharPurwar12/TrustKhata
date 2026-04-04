export const calculateTrust = (transactions = []) => {
  if (!transactions.length) {
    return 72;
  }

  const totals = transactions.reduce(
    (summary, transaction) => {
      const amount = Number(transaction.amount || 0);

      if (transaction.type === 'PAYMENT') {
        summary.payments += amount;
        summary.paymentCount += 1;
      } else {
        summary.credits += amount;
        summary.creditCount += 1;
      }

      return summary;
    },
    { credits: 0, payments: 0, creditCount: 0, paymentCount: 0 }
  );

  const recoveryRatio = totals.credits
    ? Math.min(totals.payments / totals.credits, 1)
    : 0.7;
  const activityBonus = Math.min(transactions.length * 3, 18);
  const paymentMixBonus = totals.paymentCount >= totals.creditCount ? 10 : 4;
  const score = 48 + recoveryRatio * 28 + activityBonus + paymentMixBonus;

  return Math.max(35, Math.min(98, Math.round(score)));
};

export const formatCurrency = (value = 0) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export const formatCompactCurrency = (value = 0) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number(value) || 0);

export const formatDate = (value) => {
  if (!value) {
    return 'Today';
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
};

export const getOutstandingAmount = (transactions = []) =>
  transactions.reduce((runningTotal, transaction) => {
    const amount = Number(transaction.amount || 0);

    return transaction.type === 'PAYMENT'
      ? runningTotal - amount
      : runningTotal + amount;
  }, 0);
