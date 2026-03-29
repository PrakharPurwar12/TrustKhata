import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { customerService } from '../services/customerService';
import TransactionForm from '../components/TransactionForm';

const CustomerDetail = () => {
    const { id } = useParams();
    const [customer, setCustomer] = useState(null);

    useEffect(() => {
        customerService.getById(id)
            .then(res => setCustomer(res.data))
            .catch(err => console.error(err));
    }, [id]);

    if (!customer) return <div>Loading...</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h2>{customer.name} details</h2>
            <p>Phone: {customer.phone}</p>
            <TransactionForm customerId={customer.id} />
        </div>
    );
};

export default CustomerDetail;
