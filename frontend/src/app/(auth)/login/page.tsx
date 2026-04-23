'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';
import styles from './auth.module.css';

export default function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      showToast('Welcome back!', 'success');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showToast(error.response?.data?.message || 'Invalid credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authBackground}>
        <div className={styles.bgOrb1} />
        <div className={styles.bgOrb2} />
        <div className={styles.bgOrb3} />
      </div>
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>🎫</span>
              <h1>TicketFlow</h1>
            </div>
            <p>Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.authForm}>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
              {loading ? <span className="spinner spinner-sm" /> : 'Sign In'}
            </button>
          </form>

          <div className={styles.authDivider} />

          <div className={styles.demoCredentials}>
            <p className={styles.demoTitle}>Demo Credentials</p>
            <div className={styles.demoGrid}>
              <button onClick={() => { setEmail('admin@ticketing.com'); setPassword('admin123'); }} className={styles.demoBtn}>
                <span className="badge badge-role-admin">Admin</span>
                <span>admin@ticketing.com</span>
              </button>
              <button onClick={() => { setEmail('agent@ticketing.com'); setPassword('agent123'); }} className={styles.demoBtn}>
                <span className="badge badge-role-support_agent">Agent</span>
                <span>agent@ticketing.com</span>
              </button>
              <button onClick={() => { setEmail('user@ticketing.com'); setPassword('user123'); }} className={styles.demoBtn}>
                <span className="badge badge-role-user">User</span>
                <span>user@ticketing.com</span>
              </button>
            </div>
          </div>

          <p className={styles.authFooter}>
            Don&apos;t have an account? <Link href="/register">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
