'use client';

import React, { useEffect, useState } from 'react';
import { User, Role } from '@/types';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/api';
import { getInitials, formatDate } from '@/lib/utils';

export default function UserManagementPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'USER' as Role });

  const fetchUsers = async () => {
    try {
      const res = await api.get<User[]>('/admin/users');
      setUsers(res.data);
    } catch { showToast('Failed to load users', 'error'); }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', form);
      showToast('User created', 'success');
      setShowModal(false);
      setForm({ firstName: '', lastName: '', email: '', password: '', role: 'USER' });
      fetchUsers();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showToast(error.response?.data?.message || 'Failed to create user', 'error');
    }
  };

  const changeRole = async (userId: number, role: Role) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      showToast('Role updated', 'success');
      fetchUsers();
    } catch { showToast('Failed to update role', 'error'); }
  };

  const toggleActive = async (userId: number) => {
    try {
      await api.patch(`/admin/users/${userId}/toggle-active`);
      showToast('User status updated', 'success');
      fetchUsers();
    } catch { showToast('Failed to update user', 'error'); }
  };

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>User Management 👥</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>➕ Add User</button>
      </div>

      <div className="glass-card" style={{ padding: 0 }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-sm">
                      <div className="avatar avatar-sm">{getInitials(u.fullName)}</div>
                      <span style={{ fontWeight: 500 }}>{u.fullName}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>{u.email}</td>
                  <td>
                    <select className="input-field" value={u.role}
                      onChange={e => changeRole(u.id, e.target.value as Role)}
                      style={{ padding: '6px 10px', fontSize: 'var(--font-size-xs)', width: '150px' }}>
                      <option value="USER">User</option>
                      <option value="SUPPORT_AGENT">Support Agent</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td>
                    <span className={`badge ${u.isActive ? 'badge-resolved' : 'badge-closed'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>{formatDate(u.createdAt)}</td>
                  <td>
                    <button className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-primary'}`}
                      onClick={() => toggleActive(u.id)}>
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New User</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={createUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label>First Name</label>
                  <input type="text" className="input-field" value={form.firstName}
                    onChange={e => setForm({ ...form, firstName: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label>Last Name</label>
                  <input type="text" className="input-field" value={form.lastName}
                    onChange={e => setForm({ ...form, lastName: e.target.value })} required />
                </div>
              </div>
              <div className="input-group">
                <label>Email</label>
                <input type="email" className="input-field" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="input-group">
                <label>Password</label>
                <input type="password" className="input-field" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
              </div>
              <div className="input-group">
                <label>Role</label>
                <select className="input-field" value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value as Role })}>
                  <option value="USER">User</option>
                  <option value="SUPPORT_AGENT">Support Agent</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="flex gap-sm">
                <button type="submit" className="btn btn-primary">Create User</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
