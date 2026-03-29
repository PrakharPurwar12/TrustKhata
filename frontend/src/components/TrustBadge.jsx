import React from 'react';

const TrustBadge = ({ score }) => {
    const color = score > 80 ? 'green' : score > 50 ? 'orange' : 'red';
    return (
        <span style={{ background: color, color: 'white', padding: '2px 5px', borderRadius: '3px', fontSize: '12px' }}>
            Trust: {score}%
        </span>
    );
};

export default TrustBadge;
