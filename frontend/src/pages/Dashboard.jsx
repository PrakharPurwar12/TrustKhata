import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { customerService } from '../services/customerService';
import { transactionService } from '../services/transactionService';
import {
  calculateTrust,
  formatCompactCurrency,
  formatCurrency,
  formatDate,
  getOutstandingAmount,
} from '../utils/calculateTrust';
import { sampleCustomers, sampleTransactions } from '../utils/demoData';

const Dashboard = () => {
  const [dashboardMessage, setDashboardMessage] = useState('Building today\'s trust summary...');
  const [customers, setCustomers] = useState(sampleCustomers);
  const [transactions, setTransactions] = useState(sampleTransactions);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [dashboardResponse, customerResponse, transactionResponse] = await Promise.all([
          api.get('dashboard/'),
          customerService.getAll(),
          transactionService.getAll(),
        ]);

        setDashboardMessage(
          dashboardResponse.data?.message || 'Backend connected. Your workspace is ready.'
        );
        setCustomers(customerResponse.data?.length ? customerResponse.data : sampleCustomers);
        setTransactions(
          transactionResponse.data?.length ? transactionResponse.data : sampleTransactions
        );
      } catch (error) {
        setDashboardMessage('Backend reachable ho ya na ho, UI workspace ready hai.');
        setCustomers(sampleCustomers);
        setTransactions(sampleTransactions);
      }
    };

    loadDashboard();
  }, []);

  const totalOutstanding = getOutstandingAmount(transactions);
  const totalCredit = transactions
    .filter((transaction) => transaction.type === 'CREDIT')
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
  const totalPayments = transactions
    .filter((transaction) => transaction.type === 'PAYMENT')
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
  const averageTrust = Math.round(
    customers.reduce((sum, customer) => {
      const customerTransactions = transactions.filter(
        (transaction) => Number(transaction.customer) === Number(customer.id)
      );
      return sum + calculateTrust(customerTransactions);
    }, 0) / customers.length
  );

  const recentEntries = [...transactions]
    .sort((first, second) => new Date(second.date) - new Date(first.date))
    .slice(0, 4);

  return (
    <section className="page">
      <div className="hero-panel">
        <div className="hero-panel__grid">
          <div className="hero-panel__copy">
            <span className="eyebrow">Daily control room</span>
            <h1>Trust-led recovery dashboard for your daily ledger rhythm.</h1>
            <p>{dashboardMessage}</p>

            <div className="hero-panel__chips">
              <div className="chip">
                <span className="chip__label">Customers tracked</span>
                <span className="chip__value">{customers.length}</span>
              </div>
              <div className="chip">
                <span className="chip__label">Payments received</span>
                <span className="chip__value">{formatCompactCurrency(totalPayments)}</span>
              </div>
              <div className="chip">
                <span className="chip__label">Average trust</span>
                <span className="chip__value">{averageTrust}%</span>
              </div>
            </div>
          </div>

          <div className="hero-panel__card">
            <span className="chip__label">Outstanding book</span>
            <div className="hero-panel__card-value">{formatCurrency(totalOutstanding)}</div>
            <p>Credit issued {formatCompactCurrency(totalCredit)} across current active ledgers.</p>
          </div>
        </div>
      </div>

      <div className="metric-grid">
        <article className="surface-card metric-card">
          <span className="metric-card__label">Receivable position</span>
          <strong className="metric-card__value">{formatCurrency(totalOutstanding)}</strong>
          <span className="metric-card__hint">Net credit after payment adjustments</span>
        </article>

        <article className="surface-card metric-card">
          <span className="metric-card__label">Transaction volume</span>
          <strong className="metric-card__value">{transactions.length}</strong>
          <span className="metric-card__hint">Recent credit and payment actions combined</span>
        </article>

        <article className="surface-card metric-card">
          <span className="metric-card__label">Collection pulse</span>
          <strong className="metric-card__value">
            {totalCredit ? Math.round((totalPayments / totalCredit) * 100) : 0}%
          </strong>
          <span className="metric-card__hint">Recovery ratio against issued credit</span>
        </article>

        <article className="surface-card metric-card">
          <span className="metric-card__label">Today\'s suggestion</span>
          <strong className="metric-card__value">2 follow-ups</strong>
          <span className="metric-card__hint">Start with lowest trust open ledgers</span>
        </article>
      </div>

      <div className="two-column">
        <section className="surface-card">
          <div className="surface-card__header">
            <div className="surface-card__header-copy">
              <span className="eyebrow">Recent activity</span>
              <h2 className="surface-card__title">What moved recently</h2>
            </div>
          </div>

          <div className="activity-list">
            {recentEntries.map((entry) => (
              <article className="activity-item" key={entry.id}>
                <div>
                  <div className="activity-item__title">
                    {customers.find((customer) => Number(customer.id) === Number(entry.customer))
                      ?.name || `Customer ${entry.customer}`}
                  </div>
                  <p className="activity-item__meta">
                    {entry.note || 'No note added'}  |  {formatDate(entry.date)}
                  </p>
                </div>
                <div
                  className={`activity-item__amount activity-item__amount--${
                    entry.type === 'PAYMENT' ? 'payment' : 'credit'
                  }`}
                >
                  {entry.type === 'PAYMENT' ? '-' : '+'}
                  {formatCurrency(entry.amount)}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="surface-card">
          <div className="surface-card__header">
            <div className="surface-card__header-copy">
              <span className="eyebrow">Recovery notes</span>
              <h2 className="surface-card__title">Next best actions</h2>
            </div>
          </div>

          <div className="stat-list">
            <div className="stat-list__row">
              <span>High confidence ledgers</span>
              <strong>
                {
                  customers.filter((customer) => {
                    const entries = transactions.filter(
                      (transaction) => Number(transaction.customer) === Number(customer.id)
                    );
                    return calculateTrust(entries) >= 82;
                  }).length
                }
              </strong>
            </div>
            <div className="stat-list__row">
              <span>Customers needing call-back</span>
              <strong>
                {
                  customers.filter((customer) => {
                    const entries = transactions.filter(
                      (transaction) => Number(transaction.customer) === Number(customer.id)
                    );
                    return calculateTrust(entries) < 70;
                  }).length
                }
              </strong>
            </div>
            <div className="stat-list__row">
              <span>Suggested follow-up slot</span>
              <strong>4:00 PM to 6:00 PM</strong>
            </div>
            <div className="stat-list__row">
              <span>Design mode</span>
              <strong>Fallback-ready UI enabled</strong>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
};

export default Dashboard;
