export function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function normalizeShop(shop) {
  if (!shop) {
    return shop;
  }

  return {
    ...shop,
    id: toNumber(shop.id),
    user: toNumber(shop.user),
  };
}

export function normalizeCustomer(customer) {
  if (!customer) {
    return customer;
  }

  return {
    ...customer,
    id: toNumber(customer.id),
    shop: toNumber(customer.shop),
    total_credit: toNumber(customer.total_credit),
    total_payment: toNumber(customer.total_payment),
    balance: toNumber(customer.balance),
  };
}

export function normalizeCustomers(customers = []) {
  return customers.map(normalizeCustomer);
}

export function normalizeTransaction(transaction) {
  if (!transaction) {
    return transaction;
  }

  return {
    ...transaction,
    id: toNumber(transaction.id),
    customer: toNumber(transaction.customer),
    amount: toNumber(transaction.amount),
  };
}

export function normalizeTransactions(transactions = []) {
  return transactions.map(normalizeTransaction);
}

export function normalizeSummary(summary) {
  return {
    to_get: toNumber(summary?.to_get),
    to_give: toNumber(summary?.to_give),
  };
}
