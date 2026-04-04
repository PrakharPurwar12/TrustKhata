import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import TransactionForm from '../components/TransactionForm';
import TrustBadge from '../components/TrustBadge';
import { customerService } from '../services/customerService';
import { transactionService } from '../services/transactionService';
import {
  calculateTrust,
  formatCurrency,
  formatDate,
  getOutstandingAmount,
} from '../utils/calculateTrust';
import { getFallbackCustomer, sampleTransactions } from '../utils/demoData';

const CustomerDetail = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const loadCustomer = async () => {
      try {
        const [customerResponse, transactionResponse] = await Promise.all([
          customerService.getById(id),
          transactionService.getAll(),
        ]);

        setCustomer({
          ...getFallbackCustomer(id),
          ...customerResponse.data,
        });

        const apiTransactions = transactionResponse.data?.length
          ? transactionResponse.data.filter(
              (transaction) => Number(transaction.customer) === Number(id)
            )
          : customerResponse.data?.transactions || [];

        setTransactions(
          apiTransactions.length
            ? apiTransactions
            : sampleTransactions.filter((transaction) => Number(transaction.customer) === Number(id))
        );
      } catch (error) {
        setCustomer(getFallbackCustomer(id));
        setTransactions(
          sampleTransactions.filter((transaction) => Number(transaction.customer) === Number(id))
        );
      }
    };

    loadCustomer();
  }, [id]);

  const summary = useMemo(() => {
    const outstanding = getOutstandingAmount(transactions);
    const trustScore = calculateTrust(transactions);
    const credits = transactions
      .filter((transaction) => transaction.type === 'CREDIT')
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
    const payments = transactions
      .filter((transaction) => transaction.type === 'PAYMENT')
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

    return {
      outstanding,
      trustScore,
      credits,
      payments,
      latest: transactions.length ? formatDate(transactions.at(-1).date) : 'No updates yet',
    };
  }, [transactions]);

  const handleCreatedTransaction = (newTransaction) => {
    setTransactions((current) => [
      ...current,
      {
        ...newTransaction,
        customer: Number(id),
      },
    ]);
  };

  if (!customer) {
    return <div className="empty-state">Ledger load ho raha hai...</div>;
  }

  return (
    <section className="page">
      <header className="page-header">
        <div className="page-header__copy">
          <span className="eyebrow">Customer ledger</span>
          <h1 className="page-header__title">{customer.name}</h1>
          <p>
            {customer.phone || 'Phone pending'}{customer.city ? `  |  ${customer.city}` : ''}
          </p>
        </div>
        <div className="toolbar__group">
          <TrustBadge score={summary.trustScore} />
          <Link className="button button--secondary" to="/customers">
            Back to customers
          </Link>
        </div>
      </header>

      <div className="detail-grid">
        <section className="surface-card">
          <div className="surface-card__header">
            <div className="surface-card__header-copy">
              <span className="eyebrow">Ledger summary</span>
              <h2 className="surface-card__title">Current customer snapshot</h2>
            </div>
          </div>

          <div className="metric-grid">
            <article className="metric-card">
              <span className="metric-card__label">Outstanding</span>
              <strong className="metric-card__value">{formatCurrency(summary.outstanding)}</strong>
              <span className="metric-card__hint">Pending after all payments</span>
            </article>
            <article className="metric-card">
              <span className="metric-card__label">Credits issued</span>
              <strong className="metric-card__value">{formatCurrency(summary.credits)}</strong>
              <span className="metric-card__hint">Total goods/services billed</span>
            </article>
            <article className="metric-card">
              <span className="metric-card__label">Payments received</span>
              <strong className="metric-card__value">{formatCurrency(summary.payments)}</strong>
              <span className="metric-card__hint">Settled amount till now</span>
            </article>
            <article className="metric-card">
              <span className="metric-card__label">Last activity</span>
              <strong className="metric-card__value">{summary.latest}</strong>
              <span className="metric-card__hint">Most recent ledger movement</span>
            </article>
          </div>
        </section>

        <section className="surface-card">
          <div className="surface-card__header">
            <div className="surface-card__header-copy">
              <span className="eyebrow">Relationship signal</span>
              <h2 className="surface-card__title">Trust and collection read</h2>
            </div>
          </div>

          <div className="stat-list">
            <div className="stat-list__row">
              <span>Trust score</span>
              <strong>{summary.trustScore}%</strong>
            </div>
            <div className="stat-list__row">
              <span>Transaction count</span>
              <strong>{transactions.length}</strong>
            </div>
            <div className="stat-list__row">
              <span>Follow-up tone</span>
              <strong>{summary.trustScore >= 80 ? 'Friendly reminder' : 'Active collection'}</strong>
            </div>
            <div className="stat-list__row">
              <span>Suggested next step</span>
              <strong>
                {summary.outstanding > 0 ? 'Ask for settlement date' : 'Offer fresh credit carefully'}
              </strong>
            </div>
          </div>
        </section>
      </div>

      <div className="detail-grid">
        <section className="surface-card">
          <div className="surface-card__header">
            <div className="surface-card__header-copy">
              <span className="eyebrow">Activity stream</span>
              <h2 className="surface-card__title">Recent ledger entries</h2>
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="empty-state">Abhi koi transaction nahi hai. Neeche se pehla entry add karo.</div>
          ) : (
            <div className="activity-list">
              {[...transactions]
                .sort((first, second) => new Date(second.date) - new Date(first.date))
                .map((entry) => (
                  <article className="activity-item" key={entry.id}>
                    <div>
                      <div className="activity-item__title">
                        {entry.type === 'PAYMENT' ? 'Payment received' : 'Credit added'}
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
          )}
        </section>

        <TransactionForm customerId={Number(id)} onCreated={handleCreatedTransaction} />
      </div>
    </section>
  );
};

export default CustomerDetail;
