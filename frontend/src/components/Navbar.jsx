import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav style={{ padding: '10px', background: '#333', color: '#fff' }}>
            <Link to="/" style={{ color: '#fff', textDecoration: 'none', marginRight: '15px' }}>TrustKhata</Link>
            <Link to="/login" style={{ color: '#fff', textDecoration: 'none' }}>Login</Link>
        </nav>
    );
};

export default Navbar;
