'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Ticket, PageResponse } from '@/types';
import api from '@/lib/api';
import Link from 'next/link';
import { getStatusBadgeClass, getPriorityBadgeClass, getStatusLabel, getPriorityLabel, timeAgo, getInitials } from '@/lib/utils';

export default function TicketListPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<PageResponse<Ticket>>('/tickets', {
        params: {
          page, size: 10, sortBy: 'createdAt', sortDir: 'desc',
          search: search || undefined,
          status: statusFilter || undefined,
          priority: priorityFilter || undefined,
        },
      });
      setTickets(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [page, search, statusFilter, priorityFilter]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  useEffect(() => { setPage(0); }, [search, statusFilter, priorityFilter]);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>My Tickets</h1>
        </div>
        <Link href="/dashboard/tickets/new" className="btn btn-primary">➕ New Ticket</Link>
      </div>

      {/* Filters */}
      <div className="glass-card" style={{ padding: '16px', marginBottom: '20px' }}>
        <div className="flex gap-md flex-wrap items-center">
          <input type="text" className="input-field" placeholder="🔍 Search tickets..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: '200px' }} />
          <select className="input-field" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={{ width: '160px' }}>
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select className="input-field" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
            style={{ width: '160px' }}>
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ padding: '0' }}>
        {loading ? (
          <div className="loading-container"><div className="spinner" /></div>
        ) : tickets.length === 0 ? (
          <div className="empty-state" style={{ padding: '48px' }}>
            <div className="empty-icon">🔍</div>
            <h3>No tickets found</h3>
            <p>Try adjusting your filters or create a new ticket</p>
          </div>
        ) : (
          <>
            <div className="table-container" style={{ border: 'none' }}>
              <table>
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Assignee</th>
                    <th>Comments</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(ticket => (
                    <tr key={ticket.id}>
                      <td>
                        <Link href={`/dashboard/tickets/${ticket.id}`}
                          style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>
                          {ticket.ticketNumber}
                        </Link>
                      </td>
                      <td style={{ fontWeight: 500, maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <Link href={`/dashboard/tickets/${ticket.id}`} style={{ color: 'var(--text-primary)' }}>
                          {ticket.subject}
                        </Link>
                      </td>
                      <td><span className={getStatusBadgeClass(ticket.status)}>{getStatusLabel(ticket.status)}</span></td>
                      <td><span className={getPriorityBadgeClass(ticket.priority)}>{getPriorityLabel(ticket.priority)}</span></td>
                      <td>
                        {ticket.assignee ? (
                          <div className="flex items-center gap-sm">
                            <div className="avatar avatar-sm">{getInitials(ticket.assignee.fullName)}</div>
                            <span style={{ fontSize: 'var(--font-size-sm)' }}>{ticket.assignee.fullName}</span>
                          </div>
                        ) : <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>Unassigned</span>}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>💬 {ticket.commentCount}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>{timeAgo(ticket.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button disabled={page === 0} onClick={() => setPage(p => p - 1)}>‹</button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} className={page === i ? 'active' : ''} onClick={() => setPage(i)}>
                    {i + 1}
                  </button>
                ))}
                <button disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)}>›</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
