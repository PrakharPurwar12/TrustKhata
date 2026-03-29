import React from 'react';

const TransactionForm = ({ customerId }) => {
    return (
        <form style={{ marginTop: '20px' }}>
            <h4>New Transaction</h4>
            <input type="number" placeholder="Amount" />
            <select>
                <option value="CREDIT">Credit</option>
                <option value="PAYMENT">Payment</option>
            </select>
            <button type="submit">Save</button>
        </form>
    );
};

export default TransactionForm;
