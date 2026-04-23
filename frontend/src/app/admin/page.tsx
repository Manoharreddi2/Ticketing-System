'use client';

import React, { useEffect, useState } from 'react';
import { DashboardStats } from '@/types';
import api from '@/lib/api';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<DashboardStats>('/admin/dashboard')
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;
  if (!stats) return null;

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginBottom: '24px' }}>
        Admin Dashboard 📊
      </h1>

      <div className="stats-grid" style={{ marginBottom: '32px' }}>
        <div className="stat-card stat-total">
          <div className="stat-value">{stats.totalTickets}</div>
          <div className="stat-label">Total Tickets</div>
        </div>
        <div className="stat-card stat-open">
          <div className="stat-value">{stats.openTickets}</div>
          <div className="stat-label">Open</div>
        </div>
        <div className="stat-card stat-progress">
          <div className="stat-value">{stats.inProgressTickets}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card stat-resolved">
          <div className="stat-value">{stats.resolvedTickets}</div>
          <div className="stat-label">Resolved</div>
        </div>
        <div className="stat-card stat-closed">
          <div className="stat-value">{stats.closedTickets}</div>
          <div className="stat-label">Closed</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Priority Breakdown */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: '16px' }}>
            Tickets by Priority
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(stats.ticketsByPriority).map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between">
                <span className={`badge badge-${priority.toLowerCase()}`}>{priority}</span>
                <div className="flex items-center gap-md" style={{ flex: 1, marginLeft: '16px' }}>
                  <div style={{
                    flex: 1, height: '8px', background: 'var(--bg-input)', borderRadius: '4px', overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${stats.totalTickets ? (count / stats.totalTickets) * 100 : 0}%`,
                      height: '100%',
                      background: 'var(--accent-gradient)',
                      borderRadius: '4px',
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                  <span style={{ fontWeight: 700, minWidth: '30px', textAlign: 'right' }}>{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Workload */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: '16px' }}>
            Agent Workload
          </h3>
          {Object.keys(stats.ticketsByAgent).length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No agents assigned yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(stats.ticketsByAgent).map(([agent, count]) => (
                <div key={agent} className="flex items-center justify-between">
                  <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{agent}</span>
                  <div className="flex items-center gap-md" style={{ flex: 1, marginLeft: '16px' }}>
                    <div style={{
                      flex: 1, height: '8px', background: 'var(--bg-input)', borderRadius: '4px', overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${stats.totalTickets ? (count / stats.totalTickets) * 100 : 0}%`,
                        height: '100%',
                        background: 'linear-gradient(135deg, #00cec9, #00b894)',
                        borderRadius: '4px',
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                    <span style={{ fontWeight: 700, minWidth: '30px', textAlign: 'right' }}>{count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: '16px' }}>
            Users
          </h3>
          <div className="flex gap-xl">
            <div>
              <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--info)' }}>{stats.totalUsers}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>Regular Users</div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--success)' }}>{stats.totalAgents}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>Support Agents</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
