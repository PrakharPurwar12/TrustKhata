import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', title: 'Dashboard', meta: 'Daily health and recovery', shortcut: '01' },
  { to: '/customers', title: 'Customers', meta: 'Ledger, trust, and follow-up', shortcut: '02' },
];

const Sidebar = ({ isOpen, onNavigate }) => (
  <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
    <section className="sidebar__panel">
      <span className="sidebar__eyebrow">Ledger cockpit</span>
      <h2 className="sidebar__heading">Clean books. Clear follow-up. Better recovery.</h2>
      <p className="sidebar__text">
        Aaj ka focus balance, trust score aur recent activity ko ek jagah se operate karna hai.
      </p>
    </section>

    <nav className="sidebar__nav">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          className={({ isActive }) =>
            `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
          }
          to={item.to}
          onClick={onNavigate}
        >
          <span className="sidebar__link-copy">
            <span className="sidebar__link-title">{item.title}</span>
            <span className="sidebar__link-meta">{item.meta}</span>
          </span>
          <span className="sidebar__shortcut">{item.shortcut}</span>
        </NavLink>
      ))}
    </nav>

    <section className="sidebar__panel">
      <span className="sidebar__eyebrow">Today</span>
      <div className="sidebar__stats">
        <div className="sidebar__stat">
          <span>Best habit</span>
          <strong>Same-day follow-up</strong>
        </div>
        <div className="sidebar__stat">
          <span>Recovery vibe</span>
          <strong>Steady</strong>
        </div>
        <div className="sidebar__stat">
          <span>Recommended</span>
          <strong>Review top debtors</strong>
        </div>
      </div>
    </section>
  </aside>
);

export default Sidebar;
