import React, { useEffect, useState } from 'react';
import { customerService } from '../services/customerService';
import CustomerCard from '../components/CustomerCard';

const Customers = () => {
    const [customers, setCustomers] = useState([]);

    useEffect(() => {
        customerService.getAll()
            .then(res => setCustomers(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h2>Customers</h2>
            {customers.length === 0 ? <p>No customers found.</p> : customers.map(c => <CustomerCard key={c.id} customer={c} />)}
        </div>
    );
};

export default Customers;
