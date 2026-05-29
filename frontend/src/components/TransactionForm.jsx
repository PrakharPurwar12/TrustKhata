import React, { useState } from 'react';
import { transactionService } from '../services/transactionService';

const initialForm = {
  amount: '',
  type: 'CREDIT',
  note: '',
};

const TransactionForm = ({ customerId, onCreated }) => {
  const [formData, setFormData] = useState(initialForm);
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus('');

    const payload = {
      customer: customerId,
      amount: Number(formData.amount),
      type: formData.type,
      note: formData.note.trim(),
    };

    try {
      const response = await transactionService.create(payload);
      onCreated?.(response.data);
      setFormData(initialForm);
      setStatus('saved');
    } catch {
      onCreated?.({ ...payload, id: Date.now() });
      setFormData(initialForm);
      setStatus('offline');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="surface-card">
      <div className="surface-card__header">
        <div className="surface-card__header-copy">
          <span className="eyebrow">New entry</span>
          <h3 className="surface-card__title">Add credit or payment</h3>
          <p>Ledger update karo aur customer conversation fresh rakho.</p>
        </div>
        {status === 'saved' ? (
          <span className="status-pill status-pill--success">Saved to API</span>
        ) : null}
        {status === 'offline' ? (
          <span className="status-pill status-pill--warning">Saved locally for demo</span>
        ) : null}
      </div>

      <form className="stack" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            <span className="form-note">Amount</span>
            <input
              className="input"
              min="1"
              name="amount"
              placeholder="5000"
              required
              type="number"
              value={formData.amount}
              onChange={handleChange}
            />
          </label>

          <label>
            <span className="form-note">Entry type</span>
            <select
              className="select"
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="CREDIT">Credit</option>
              <option value="PAYMENT">Payment</option>
            </select>
          </label>

          <label className="form-grid__full">
            <span className="form-note">Note</span>
            <textarea
              className="textarea"
              name="note"
              placeholder="e.g. April stock top-up or partial cash received"
              value={formData.note}
              onChange={handleChange}
            />
          </label>
        </div>

        <div className="toolbar">
          <p className="form-note">Quick entries keep trust score and reminders more accurate.</p>
          <button className="button button--primary" disabled={submitting} type="submit">
            {submitting ? 'Saving...' : 'Save transaction'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default TransactionForm;
