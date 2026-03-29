import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
    return (
        <aside style={{ width: '200px', background: '#f4f4f4', padding: '10px', height: '100vh' }}>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><Link to="/customers">Customers</Link></li>
            </ul>
        </aside>
    );
};

export default Sidebar;
