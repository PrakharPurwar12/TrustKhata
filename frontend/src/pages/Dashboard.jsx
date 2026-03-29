import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Dashboard = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        api.get('dashboard/')
            .then(res => setData(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h2>Dashboard</h2>
            <p>{data ? data.message : "Loading..."}</p>
        </div>
    );
};

export default Dashboard;
