'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DashboardStats, Ticket } from '@/types';
import api from '@/lib/api';
import Link from 'next/link';
import { getStatusBadgeClass, getPriorityBadgeClass, getStatusLabel, getPriorityLabel, timeAgo, getInitials } from '@/lib/utils';

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ticketsRes] = await Promise.all([
          isAdmin ? api.get('/admin/dashboard') : api.get('/users/dashboard-stats'),
          api.get('/tickets', { params: { page: 0, size: 5, sortBy: 'createdAt', sortDir: 'desc' } }),
        ]);
        setStats(statsRes.data);
        setRecentTickets(ticketsRes.data.content);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchData();
  }, [isAdmin]);

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginBottom: '4px' }}>
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Here&apos;s what&apos;s happening with your tickets</p>
      </div>

      {stats && (
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
      )}

      <div className="glass-card" style={{ padding: '24px' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>Recent Tickets</h2>
          <Link href="/dashboard/tickets" className="btn btn-secondary btn-sm">View All →</Link>
        </div>

        {recentTickets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎫</div>
            <h3>No tickets yet</h3>
            <p>Create your first ticket to get started</p>
            <Link href="/dashboard/tickets/new" className="btn btn-primary" style={{ marginTop: '16px' }}>
              Create Ticket
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Assignee</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.map(ticket => (
                  <tr key={ticket.id} style={{ cursor: 'pointer' }}
                    onClick={() => window.location.href = `/dashboard/tickets/${ticket.id}`}>
                    <td style={{ color: 'var(--accent-secondary)', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                      {ticket.ticketNumber}
                    </td>
                    <td style={{ fontWeight: 500, maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ticket.subject}
                    </td>
                    <td><span className={getStatusBadgeClass(ticket.status)}>{getStatusLabel(ticket.status)}</span></td>
                    <td><span className={getPriorityBadgeClass(ticket.priority)}>{getPriorityLabel(ticket.priority)}</span></td>
                    <td>
                      {ticket.assignee ? (
                        <div className="flex items-center gap-sm">
                          <div className="avatar avatar-sm">{getInitials(ticket.assignee.fullName)}</div>
                          <span style={{ fontSize: 'var(--font-size-sm)' }}>{ticket.assignee.fullName}</span>
                        </div>
                      ) : <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>{timeAgo(ticket.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
