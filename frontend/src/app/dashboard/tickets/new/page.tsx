'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/api';

export default function NewTicketPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/tickets', { subject, description, priority });
      showToast(`Ticket ${res.data.ticketNumber} created successfully!`, 'success');
      router.push(`/dashboard/tickets/${res.data.id}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showToast(error.response?.data?.message || 'Failed to create ticket', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '700px' }}>
      <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginBottom: '24px' }}>
        Create New Ticket
      </h1>

      <div className="glass-card" style={{ padding: '32px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="input-group">
            <label htmlFor="subject">Subject *</label>
            <input id="subject" type="text" className="input-field"
              placeholder="Brief summary of the issue"
              value={subject} onChange={e => setSubject(e.target.value)} required />
          </div>

          <div className="input-group">
            <label htmlFor="description">Description *</label>
            <textarea id="description" className="input-field"
              placeholder="Describe the issue in detail..."
              value={description} onChange={e => setDescription(e.target.value)}
              required rows={6} />
          </div>

          <div className="input-group">
            <label htmlFor="priority">Priority</label>
            <select id="priority" className="input-field"
              value={priority} onChange={e => setPriority(e.target.value)}>
              <option value="LOW">🟢 Low</option>
              <option value="MEDIUM">🟡 Medium</option>
              <option value="HIGH">🟠 High</option>
              <option value="URGENT">🔴 Urgent</option>
            </select>
          </div>

          <div className="flex gap-md" style={{ marginTop: '8px' }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? <span className="spinner spinner-sm" /> : '🎫 Create Ticket'}
            </button>
            <button type="button" className="btn btn-secondary btn-lg" onClick={() => router.back()}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
