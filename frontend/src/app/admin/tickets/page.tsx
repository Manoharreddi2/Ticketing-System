'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Ticket, PageResponse, User } from '@/types';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/api';
import Link from 'next/link';
import { getStatusBadgeClass, getPriorityBadgeClass, getStatusLabel, getPriorityLabel, timeAgo, getInitials } from '@/lib/utils';

export default function AdminTicketsPage() {
  const { showToast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [agents, setAgents] = useState<User[]>([]);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<PageResponse<Ticket>>('/admin/tickets', {
        params: {
          page, size: 10, sortBy: 'createdAt', sortDir: 'desc',
          search: search || undefined,
          status: statusFilter || undefined,
          priority: priorityFilter || undefined,
        },
      });
      setTickets(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch { showToast('Failed to load tickets', 'error'); }
    setLoading(false);
  }, [page, search, statusFilter, priorityFilter, showToast]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);
  useEffect(() => { setPage(0); }, [search, statusFilter, priorityFilter]);
  useEffect(() => {
    api.get<User[]>('/admin/users/agents').then(r => setAgents(r.data)).catch(() => {});
  }, []);

  const forceAssign = async (ticketId: number, assigneeId: number) => {
    try {
      await api.patch(`/admin/tickets/${ticketId}/force-assign`, { assigneeId });
      showToast('Ticket assigned', 'success');
      fetchTickets();
    } catch { showToast('Failed to assign', 'error'); }
  };

  const forceStatus = async (ticketId: number, status: string) => {
    try {
      await api.patch(`/admin/tickets/${ticketId}/force-status`, { status });
      showToast(`Status changed to ${status}`, 'success');
      fetchTickets();
    } catch { showToast('Failed to change status', 'error'); }
  };

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginBottom: '24px' }}>
        All Tickets 📋
      </h1>

      <div className="glass-card" style={{ padding: '16px', marginBottom: '20px' }}>
        <div className="flex gap-md flex-wrap items-center">
          <input type="text" className="input-field" placeholder="🔍 Search..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: '200px' }} />
          <select className="input-field" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={{ width: '150px' }}>
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select className="input-field" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
            style={{ width: '150px' }}>
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading-container"><div className="spinner" /></div>
        ) : tickets.length === 0 ? (
          <div className="empty-state" style={{ padding: '48px' }}>
            <div className="empty-icon">📋</div>
            <h3>No tickets found</h3>
          </div>
        ) : (
          <>
            <div className="table-container" style={{ border: 'none' }}>
              <table>
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Subject</th>
                    <th>Creator</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Assignee</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(ticket => (
                    <tr key={ticket.id}>
                      <td>
                        <Link href={`/dashboard/tickets/${ticket.id}`}
                          style={{ color: 'var(--accent-secondary)', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                          {ticket.ticketNumber}
                        </Link>
                      </td>
                      <td style={{ fontWeight: 500, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ticket.subject}
                      </td>
                      <td>
                        <div className="flex items-center gap-sm">
                          <div className="avatar avatar-sm">{getInitials(ticket.creator.fullName)}</div>
                          <span style={{ fontSize: 'var(--font-size-sm)' }}>{ticket.creator.fullName}</span>
                        </div>
                      </td>
                      <td>
                        <select className="input-field" value={ticket.status}
                          onChange={e => forceStatus(ticket.id, e.target.value)}
                          style={{ padding: '4px 8px', fontSize: 'var(--font-size-xs)', width: '130px' }}>
                          <option value="OPEN">Open</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="RESOLVED">Resolved</option>
                          <option value="CLOSED">Closed</option>
                        </select>
                      </td>
                      <td><span className={getPriorityBadgeClass(ticket.priority)}>{getPriorityLabel(ticket.priority)}</span></td>
                      <td>
                        <select className="input-field" value={ticket.assignee?.id || ''}
                          onChange={e => e.target.value && forceAssign(ticket.id, Number(e.target.value))}
                          style={{ padding: '4px 8px', fontSize: 'var(--font-size-xs)', width: '140px' }}>
                          <option value="">Unassigned</option>
                          {agents.map(a => (
                            <option key={a.id} value={a.id}>{a.fullName}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
                        {timeAgo(ticket.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button disabled={page === 0} onClick={() => setPage(p => p - 1)}>‹</button>
                {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => (
                  <button key={i} className={page === i ? 'active' : ''} onClick={() => setPage(i)}>{i + 1}</button>
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
