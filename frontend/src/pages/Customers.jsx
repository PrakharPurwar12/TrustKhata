import React, { useDeferredValue, useEffect, useMemo, useState } from 'react';
import CustomerCard from '../components/CustomerCard';
import { customerService } from '../services/customerService';
import { transactionService } from '../services/transactionService';
import {
  calculateTrust,
  formatCurrency,
  getOutstandingAmount,
} from '../utils/calculateTrust';
import { sampleCustomers, sampleTransactions } from '../utils/demoData';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState(sampleCustomers);
  const [transactions, setTransactions] = useState(sampleTransactions);
  const [query, setQuery] = useState('');
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const [customerResponse, transactionResponse] = await Promise.all([
          customerService.getAll(),
          transactionService.getAll(),
        ]);

        setCustomers(customerResponse.data?.length ? customerResponse.data : sampleCustomers);
        setTransactions(
          transactionResponse.data?.length ? transactionResponse.data : sampleTransactions
        );
      } catch (error) {
        setCustomers(sampleCustomers);
        setTransactions(sampleTransactions);
      }
    };

    loadCustomers();
  }, []);

  const deferredQuery = useDeferredValue(query);

  const enrichedCustomers = useMemo(
    () =>
      customers.map((customer) => {
        const customerTransactions = transactions.filter(
          (transaction) => Number(transaction.customer) === Number(customer.id)
        );
        const outstanding = getOutstandingAmount(customerTransactions);
        const trustScore = calculateTrust(customerTransactions);

        return {
          ...customer,
          outstanding,
          trustScore,
          transactionCount: customerTransactions.length,
          lastActivity: formatDate(customerTransactions.at(-1)?.date),
          recoveryLabel:
            trustScore >= 82 ? 'Pays consistently' : trustScore < 60 ? 'Needs nudges' : 'Stable',
        };
      }),
    [customers, transactions]
  );

  const filteredCustomers = enrichedCustomers.filter((customer) => {
    const searchableText = `${customer.name} ${customer.phone || ''} ${customer.city || ''}`.toLowerCase();
    return searchableText.includes(deferredQuery.trim().toLowerCase());
  });

  const totalOutstanding = filteredCustomers.reduce(
    (sum, customer) => sum + Number(customer.outstanding || 0),
    0
  );

  return (
    <section className="page dark:bg-slate-900 dark:text-slate-100 transition-colors duration-300 min-h-screen">
      <header className="page-header flex justify-between items-start">
        <div className="page-header__copy">
          <span className="eyebrow">Customer ledgers</span>
          <h1 className="page-header__title">Browse customers with trust context, not just names.</h1>
          <p>Search, compare outstanding balances, aur quickly identify whom to follow up next.</p>
        </div>
        <div className="flex flex-col items-end gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all"
            aria-label="Toggle Dark Mode"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <span className="status-pill">{filteredCustomers.length} visible accounts</span>
        </div>
      </header>

      <section className="surface-card">
        <div className="toolbar">
          <div className="toolbar__group">
            <label className="field">
              <input
                className="input"
                placeholder="Search by name, phone, or city"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
          </div>

          <div className="toolbar__group">
            <span className="status-pill status-pill--success">
              Outstanding {formatCurrency(totalOutstanding)}
            </span>
          </div>
        </div>
      </section>

      {filteredCustomers.length === 0 ? (
        <div className="empty-state">
          Koi match nahi mila. Search term ko thoda broad rakho ya demo data fallback ko inspect karo.
        </div>
      ) : (
        <div className="customer-grid">
          {filteredCustomers.map((customer) => (
            <CustomerCard key={customer.id} customer={customer} />
          ))}
        </div>
      )}
    </section>
  );
};

export default Customers;
