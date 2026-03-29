import React from 'react';
import { Link } from 'react-router-dom';
import TrustBadge from './TrustBadge';

const CustomerCard = ({ customer }) => {
    return (
        <div style={{ border: '1px solid #ddd', padding: '10px', margin: '10px 0' }}>
            <h3>{customer.name}</h3>
            <p>Phone: {customer.phone}</p>
            <TrustBadge score={85} />
            <Link to={`/customers/${customer.id}`}>View Details</Link>
        </div>
    );
};

export default CustomerCard;
