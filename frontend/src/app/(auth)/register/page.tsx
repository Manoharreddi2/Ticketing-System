'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';
import styles from '../login/auth.module.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(firstName, lastName, email, password);
      showToast('Account created successfully!', 'success');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showToast(error.response?.data?.message || 'Registration failed', 'error');
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
            <p>Create your account</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.authForm}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="input-group">
                <label htmlFor="firstName">First Name</label>
                <input id="firstName" type="text" className="input-field"
                  placeholder="John" value={firstName}
                  onChange={e => setFirstName(e.target.value)} required />
              </div>
              <div className="input-group">
                <label htmlFor="lastName">Last Name</label>
                <input id="lastName" type="text" className="input-field"
                  placeholder="Doe" value={lastName}
                  onChange={e => setLastName(e.target.value)} required />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" className="input-field"
                placeholder="you@example.com" value={email}
                onChange={e => setEmail(e.target.value)} required />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" className="input-field"
                placeholder="Min 6 characters" value={password}
                onChange={e => setPassword(e.target.value)} required minLength={6} />
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
              {loading ? <span className="spinner spinner-sm" /> : 'Create Account'}
            </button>
          </form>

          <p className={styles.authFooter}>
            Already have an account? <Link href="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
