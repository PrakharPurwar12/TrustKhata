import React from 'react';

const TrustBadge = ({ score = 72 }) => {
  let level = 'medium';
  let label = 'Watchlist';

  if (score >= 82) {
    level = 'high';
    label = 'Reliable';
  } else if (score < 60) {
    level = 'low';
    label = 'Follow-up';
  }

  return (
    <span className={`trust-badge trust-badge--${level}`}>
      <span className="trust-badge__dot" />
      {label} {score}%
    </span>
  );
};

export default TrustBadge;
