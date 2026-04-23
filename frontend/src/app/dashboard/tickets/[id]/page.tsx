'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TicketDetail, User, TicketStatus } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/api';
import {
  getStatusBadgeClass, getPriorityBadgeClass, getStatusLabel, getPriorityLabel,
  formatDateTime, timeAgo, getInitials, formatFileSize,
} from '@/lib/utils';
import styles from './detail.module.css';

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAdmin, isAgent } = useAuth();
  const { showToast } = useToast();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [agents, setAgents] = useState<User[]>([]);
  const [rating, setRating] = useState(0);
  const [ratingFeedback, setRatingFeedback] = useState('');
  const [showRating, setShowRating] = useState(false);

  const fetchTicket = useCallback(async () => {
    try {
      const res = await api.get<TicketDetail>(`/tickets/${params.id}`);
      setTicket(res.data);
      if (res.data.rating) setRating(res.data.rating);
    } catch { showToast('Failed to load ticket', 'error'); router.back(); }
    setLoading(false);
  }, [params.id, router, showToast]);

  useEffect(() => {
    fetchTicket();
    if (isAdmin || isAgent) {
      api.get<User[]>('/users/agents').then(r => setAgents(r.data)).catch(() => {});
    }
  }, [fetchTicket, isAdmin, isAgent]);

  const addComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/tickets/${params.id}/comments`, { content: comment });
      setComment('');
      fetchTicket();
      showToast('Comment added', 'success');
    } catch { showToast('Failed to add comment', 'error'); }
    setSubmitting(false);
  };

  const changeStatus = async (status: TicketStatus) => {
    try {
      await api.patch(`/tickets/${params.id}/status`, { status });
      fetchTicket();
      showToast(`Status changed to ${getStatusLabel(status)}`, 'success');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showToast(error.response?.data?.message || 'Failed to change status', 'error');
    }
  };

  const assignTicket = async (assigneeId: number) => {
    try {
      await api.patch(`/tickets/${params.id}/assign`, { assigneeId });
      fetchTicket();
      showToast('Ticket assigned', 'success');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showToast(error.response?.data?.message || 'Failed to assign', 'error');
    }
  };

  const submitRating = async () => {
    try {
      await api.post(`/tickets/${params.id}/rate`, { rating, feedback: ratingFeedback });
      fetchTicket();
      setShowRating(false);
      showToast('Rating submitted!', 'success');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showToast(error.response?.data?.message || 'Failed to rate', 'error');
    }
  };

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    try {
      await api.post(`/tickets/${params.id}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchTicket();
      showToast('File uploaded', 'success');
    } catch { showToast('Upload failed', 'error'); }
    e.target.value = '';
  };

  if (loading || !ticket) return <div className="loading-container"><div className="spinner" /></div>;

  const isCreator = user?.id === ticket.creator.id;
  const isAssignee = user?.id === ticket.assignee?.id;
  const canChangeStatus = isAdmin || isAssignee || isCreator;
  const canAssign = isAdmin || isAgent;
  const canRate = isCreator && !ticket.rating && (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED');

  return (
    <div className="animate-fade-in">
      <button onClick={() => router.back()} className="btn btn-ghost" style={{ marginBottom: '16px' }}>
        ← Back to tickets
      </button>

      <div className={styles.detailGrid}>
        {/* Main Content */}
        <div className={styles.mainCol}>
          {/* Ticket Info Card */}
          <div className="glass-card" style={{ padding: '28px', marginBottom: '20px' }}>
            <div className="flex items-center gap-md" style={{ marginBottom: '16px', flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--accent-secondary)', fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>
                {ticket.ticketNumber}
              </span>
              <span className={getStatusBadgeClass(ticket.status)}>{getStatusLabel(ticket.status)}</span>
              <span className={getPriorityBadgeClass(ticket.priority)}>{getPriorityLabel(ticket.priority)}</span>
            </div>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginBottom: '16px' }}>
              {ticket.subject}
            </h1>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
              {ticket.description}
            </p>
            <div className="flex items-center gap-lg" style={{ marginTop: '20px', color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
              <span>Created by <strong style={{ color: 'var(--text-secondary)' }}>{ticket.creator.fullName}</strong></span>
              <span>{formatDateTime(ticket.createdAt)}</span>
            </div>
          </div>

          {/* Rating Section */}
          {ticket.rating && (
            <div className="glass-card" style={{ padding: '20px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: '10px' }}>⭐ Resolution Rating</h3>
              <div className="star-rating" style={{ marginBottom: '8px' }}>
                {[1, 2, 3, 4, 5].map(s => (
                  <span key={s} className={`star ${s <= ticket.rating! ? 'filled' : ''}`}>★</span>
                ))}
              </div>
              {ticket.ratingFeedback && <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>&ldquo;{ticket.ratingFeedback}&rdquo;</p>}
            </div>
          )}

          {canRate && !showRating && (
            <button className="btn btn-primary" style={{ marginBottom: '20px' }} onClick={() => setShowRating(true)}>
              ⭐ Rate Resolution
            </button>
          )}

          {showRating && (
            <div className="glass-card" style={{ padding: '20px', marginBottom: '20px' }}>
              <h3 style={{ marginBottom: '12px', fontWeight: 700 }}>Rate this resolution</h3>
              <div className="star-rating" style={{ marginBottom: '12px' }}>
                {[1, 2, 3, 4, 5].map(s => (
                  <span key={s} className={`star ${s <= rating ? 'filled' : ''}`} onClick={() => setRating(s)}>★</span>
                ))}
              </div>
              <textarea className="input-field" placeholder="Optional feedback..." rows={3}
                value={ratingFeedback} onChange={e => setRatingFeedback(e.target.value)} style={{ marginBottom: '12px' }} />
              <div className="flex gap-sm">
                <button className="btn btn-primary" onClick={submitRating} disabled={!rating}>Submit</button>
                <button className="btn btn-ghost" onClick={() => setShowRating(false)}>Cancel</button>
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: '20px' }}>
              💬 Comments ({ticket.comments.length})
            </h3>

            {ticket.comments.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No comments yet</p>
            ) : (
              <div className={styles.commentList}>
                {ticket.comments.map(c => (
                  <div key={c.id} className={styles.commentItem}>
                    <div className="avatar avatar-sm">{getInitials(c.author.fullName)}</div>
                    <div className={styles.commentBody}>
                      <div className="flex items-center gap-sm">
                        <strong style={{ fontSize: 'var(--font-size-sm)' }}>{c.author.fullName}</strong>
                        <span className={`badge badge-role-${c.author.role.toLowerCase()}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                          {c.author.role.replace('_', ' ')}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>{timeAgo(c.createdAt)}</span>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: 'var(--font-size-sm)', whiteSpace: 'pre-wrap' }}>{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={addComment} style={{ marginTop: '20px' }}>
              <textarea className="input-field" placeholder="Write a comment..."
                value={comment} onChange={e => setComment(e.target.value)}
                rows={3} required />
              <button type="submit" className="btn btn-primary" disabled={submitting} style={{ marginTop: '10px' }}>
                {submitting ? <span className="spinner spinner-sm" /> : '💬 Add Comment'}
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className={styles.sideCol}>
          {/* Actions */}
          {canChangeStatus && (
            <div className="glass-card" style={{ padding: '20px', marginBottom: '16px' }}>
              <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, marginBottom: '12px', color: 'var(--text-secondary)' }}>
                CHANGE STATUS
              </h4>
              <div className="flex flex-col gap-sm">
                {ticket.status !== 'OPEN' && <button className="btn btn-secondary btn-sm" onClick={() => changeStatus('OPEN')}>↩ Re-open</button>}
                {ticket.status !== 'IN_PROGRESS' && <button className="btn btn-secondary btn-sm" onClick={() => changeStatus('IN_PROGRESS')}>⏳ In Progress</button>}
                {ticket.status !== 'RESOLVED' && <button className="btn btn-secondary btn-sm" onClick={() => changeStatus('RESOLVED')}>✅ Resolve</button>}
                {ticket.status !== 'CLOSED' && <button className="btn btn-secondary btn-sm" onClick={() => changeStatus('CLOSED')}>🔒 Close</button>}
              </div>
            </div>
          )}

          {/* Assign */}
          {canAssign && (
            <div className="glass-card" style={{ padding: '20px', marginBottom: '16px' }}>
              <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, marginBottom: '12px', color: 'var(--text-secondary)' }}>
                ASSIGN TO
              </h4>
              <select className="input-field" value={ticket.assignee?.id || ''}
                onChange={e => e.target.value && assignTicket(Number(e.target.value))}>
                <option value="">Select agent...</option>
                {agents.map(a => (
                  <option key={a.id} value={a.id}>{a.fullName}</option>
                ))}
              </select>
            </div>
          )}

          {/* Details */}
          <div className="glass-card" style={{ padding: '20px', marginBottom: '16px' }}>
            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, marginBottom: '12px', color: 'var(--text-secondary)' }}>
              DETAILS
            </h4>
            <div className={styles.detailList}>
              <div className={styles.detailRow}>
                <span>Creator</span>
                <div className="flex items-center gap-sm">
                  <div className="avatar avatar-sm">{getInitials(ticket.creator.fullName)}</div>
                  <span>{ticket.creator.fullName}</span>
                </div>
              </div>
              <div className={styles.detailRow}>
                <span>Assignee</span>
                <span>{ticket.assignee?.fullName || 'Unassigned'}</span>
              </div>
              <div className={styles.detailRow}>
                <span>Created</span>
                <span>{formatDateTime(ticket.createdAt)}</span>
              </div>
              {ticket.resolvedAt && (
                <div className={styles.detailRow}>
                  <span>Resolved</span>
                  <span>{formatDateTime(ticket.resolvedAt)}</span>
                </div>
              )}
              {ticket.closedAt && (
                <div className={styles.detailRow}>
                  <span>Closed</span>
                  <span>{formatDateTime(ticket.closedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Attachments */}
          <div className="glass-card" style={{ padding: '20px', marginBottom: '16px' }}>
            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, marginBottom: '12px', color: 'var(--text-secondary)' }}>
              📎 ATTACHMENTS ({ticket.attachments.length})
            </h4>
            {ticket.attachments.map(att => (
              <div key={att.id} className={styles.attachmentItem}>
                <div>
                  <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{att.originalFilename}</p>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{formatFileSize(att.fileSize)}</p>
                </div>
                <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/attachments/${att.id}/download`}
                  className="btn btn-ghost btn-sm" target="_blank" rel="noopener noreferrer">⬇</a>
              </div>
            ))}
            <label className="file-upload-zone" style={{ marginTop: '10px', padding: '14px', display: 'block', cursor: 'pointer' }}>
              <input type="file" hidden onChange={uploadFile} />
              <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>📎 Click to upload file</span>
            </label>
          </div>

          {/* History */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, marginBottom: '12px', color: 'var(--text-secondary)' }}>
              📜 HISTORY
            </h4>
            {ticket.history.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>No history yet</p>
            ) : (
              <div className={styles.historyList}>
                {ticket.history.map(h => (
                  <div key={h.id} className={styles.historyItem}>
                    <div className={styles.historyDot} />
                    <div>
                      <p style={{ fontSize: 'var(--font-size-sm)' }}>
                        <strong>{h.changedBy.fullName}</strong> changed <em>{h.fieldChanged}</em>
                        {h.oldValue && <> from <span style={{ color: 'var(--danger)' }}>{h.oldValue}</span></>}
                        {' '}to <span style={{ color: 'var(--success)' }}>{h.newValue}</span>
                      </p>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{timeAgo(h.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
