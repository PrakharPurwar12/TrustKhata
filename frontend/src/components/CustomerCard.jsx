import React from 'react';
import { Link } from 'react-router-dom';
import TrustBadge from './TrustBadge';
import { formatCurrency } from '../utils/calculateTrust';

const CustomerCard = ({ customer }) => (
  <article className="surface-card customer-card">
    <div className="customer-card__top">
      <div>
        <h3 className="customer-card__name">{customer.name}</h3>
        <p className="customer-card__phone">
          {customer.phone || 'Phone pending'}{customer.city ? `  |  ${customer.city}` : ''}
        </p>
      </div>
      <TrustBadge score={customer.trustScore} />
    </div>

    <div className="customer-card__stats">
      <div className="mini-stat">
        <span className="mini-stat__label">Outstanding</span>
        <span className="mini-stat__value">{formatCurrency(customer.outstanding)}</span>
      </div>
      <div className="mini-stat">
        <span className="mini-stat__label">Transactions</span>
        <span className="mini-stat__value">{customer.transactionCount}</span>
      </div>
    </div>

    <div className="stat-list">
      <div className="stat-list__row">
        <span>Last activity</span>
        <strong>{customer.lastActivity || 'No entries yet'}</strong>
      </div>
      <div className="stat-list__row">
        <span>Recovery trend</span>
        <strong>{customer.recoveryLabel}</strong>
      </div>
    </div>

    <Link className="button button--secondary" to={`/customers/${customer.id}`}>
      Open ledger
    </Link>
  </article>
);

export default CustomerCard;
