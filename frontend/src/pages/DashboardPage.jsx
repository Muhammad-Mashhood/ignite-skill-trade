import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Coins, GraduationCap, Star, Trophy,
  Search, Globe, ClipboardList, UserPen
} from 'lucide-react';
import './DashboardPage.css';

const QUICK_ACTIONS = [
  { to: '/matching', Icon: Search, label: 'Find Partner', cls: 'action-icon-purple' },
  { to: '/posts', Icon: Globe, label: 'Browse Skills', cls: 'action-icon-cyan' },
  { to: '/trades', Icon: ClipboardList, label: 'My Trades', cls: 'action-icon-amber' },
  { to: '/profile', Icon: UserPen, label: 'Edit Profile', cls: 'action-icon-green' },
];

const StatCard = ({ Icon, title, value, subtitle, accentClass }) => (
  <div className={`dashboard-card ${accentClass}`}>
    <h3>
      <Icon size={16} aria-hidden="true" />
      {title}
    </h3>
    <p className="dashboard-number">{value}</p>
    <p className="dashboard-label">{subtitle}</p>
  </div>
);

const DashboardPage = () => {
  const { user } = useAuth();

  const level = user?.level || 1;
  const sessions = user?.totalSessionsCompleted || 0;
  const progressPercent = Math.min(((sessions % 10) / 10) * 100, 100);

  return (
    <div className="dashboard-page">
      {/* Welcome */}
      <header className="dashboard-welcome">
        <p className="dashboard-welcome-eyebrow">Good to see you</p>
        <h1>Hey, {user?.name?.split(' ')[0] || 'there'}!</h1>
        <p>Here's what's happening with your skill trading today.</p>
      </header>

      {/* Stats */}
      <div className="dashboard-grid" role="list" aria-label="Your statistics">
        <StatCard
          Icon={Coins}
          title="Coins"
          value={user?.coins || 0}
          subtitle="Available balance"
          accentClass="accent-warm"
        />
        <StatCard
          Icon={GraduationCap}
          title="Sessions"
          value={sessions}
          subtitle="Total completed"
          accentClass="accent-teal"
        />
        <StatCard
          Icon={Star}
          title="Rating"
          value={user?.rating?.average?.toFixed(1) || '—'}
          subtitle={`From ${user?.rating?.count || 0} reviews`}
          accentClass="accent-orange"
        />
        <StatCard
          Icon={Trophy}
          title="Level"
          value={level}
          subtitle="Current level"
          accentClass="accent-brand"
        />
      </div>

      {/* Level progress */}
      <section className="dashboard-section" aria-label="Level progress">
        <div className="level-card">
          <div className="level-badge" aria-hidden="true">{level}</div>
          <div className="level-info">
            <h3>Level {level} Trader</h3>
            <p>{10 - (sessions % 10)} more sessions to reach level {level + 1}</p>
            <div className="level-bar" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
              <div className="level-bar-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="dashboard-section" aria-label="Quick actions">
        <div className="dashboard-section-header">
          <h2>Quick Actions</h2>
        </div>
        <div className="action-buttons">
          {QUICK_ACTIONS.map(({ to, Icon, label, cls }) => (
            <Link key={to} to={to} className="action-button">
              <div className={`action-icon ${cls}`}>
                <Icon size={20} aria-hidden="true" />
              </div>
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
