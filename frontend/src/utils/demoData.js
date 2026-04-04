export const sampleCustomers = [
  { id: 1, name: 'Aarav Traders', phone: '+91 98765 43210', city: 'Jaipur' },
  { id: 2, name: 'Neelam Kirana', phone: '+91 99880 11223', city: 'Lucknow' },
  { id: 3, name: 'Saanvi Textiles', phone: '+91 98110 55001', city: 'Surat' },
  { id: 4, name: 'Reyansh Steel', phone: '+91 99000 44112', city: 'Indore' },
];

export const sampleTransactions = [
  { id: 101, customer: 1, amount: 12000, type: 'CREDIT', date: '2026-03-30', note: 'Monthly supply' },
  { id: 102, customer: 1, amount: 5000, type: 'PAYMENT', date: '2026-04-01', note: 'Part payment' },
  { id: 103, customer: 1, amount: 3200, type: 'CREDIT', date: '2026-04-03', note: 'Add-on items' },
  { id: 104, customer: 2, amount: 8000, type: 'CREDIT', date: '2026-03-27', note: 'Bulk groceries' },
  { id: 105, customer: 2, amount: 8000, type: 'PAYMENT', date: '2026-04-02', note: 'Cleared in full' },
  { id: 106, customer: 3, amount: 22000, type: 'CREDIT', date: '2026-03-24', note: 'Wedding stock' },
  { id: 107, customer: 3, amount: 7000, type: 'PAYMENT', date: '2026-03-29', note: 'Advance collection' },
  { id: 108, customer: 4, amount: 14000, type: 'CREDIT', date: '2026-03-22', note: 'Material dispatch' },
  { id: 109, customer: 4, amount: 3000, type: 'PAYMENT', date: '2026-03-28', note: 'Weekly settlement' },
];

export const getFallbackCustomer = (customerId) => {
  const numericId = Number(customerId);

  return (
    sampleCustomers.find((customer) => customer.id === numericId) || {
      id: numericId || 999,
      name: `Customer ${customerId}`,
      phone: '+91 90000 00000',
      city: 'Ahmedabad',
    }
  );
};
