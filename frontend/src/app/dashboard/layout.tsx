'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getInitials } from '@/lib/utils';
import styles from './dashboard.module.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout, isAdmin, isAgent } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="loading-container" style={{ minHeight: '100vh' }}><div className="spinner spinner-lg" /></div>;
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/tickets', label: 'My Tickets', icon: '🎫' },
    { href: '/dashboard/tickets/new', label: 'New Ticket', icon: '➕' },
  ];

  if (isAdmin) {
    navItems.push(
      { href: '/admin', label: 'Admin Panel', icon: '⚙️' },
      { href: '/admin/users', label: 'Users', icon: '👥' },
      { href: '/admin/tickets', label: 'All Tickets', icon: '📋' },
    );
  }

  return (
    <div className={styles.dashboardLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/dashboard" className={styles.sidebarLogo}>
            <span>🎫</span>
            <span className={styles.logoText}>TicketFlow</span>
          </Link>
        </div>

        <nav className={styles.sidebarNav}>
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              className={`${styles.navItem} ${pathname === item.href ? styles.navItemActive : ''}`}>
              <span className={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className="avatar avatar-sm">{getInitials(user.fullName)}</div>
            <div className={styles.userDetails}>
              <p className={styles.userName}>{user.fullName}</p>
              <p className={styles.userRole}>{user.role.replace('_', ' ')}</p>
            </div>
          </div>
          <button onClick={logout} className={`btn btn-ghost ${styles.logoutBtn}`}>
            🚪 Logout
          </button>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h2 className={styles.pageTitle}>
              {pathname === '/dashboard' ? 'Dashboard' :
                pathname === '/dashboard/tickets' ? 'My Tickets' :
                pathname === '/dashboard/tickets/new' ? 'New Ticket' :
                pathname.startsWith('/dashboard/tickets/') ? 'Ticket Detail' :
                pathname === '/admin' ? 'Admin Dashboard' :
                pathname === '/admin/users' ? 'User Management' :
                pathname === '/admin/tickets' ? 'All Tickets' : 'Dashboard'}
            </h2>
          </div>
          <div className={styles.headerRight}>
            <span className={`badge badge-role-${user.role.toLowerCase()}`}>{user.role.replace('_', ' ')}</span>
            <div className="avatar">{getInitials(user.fullName)}</div>
          </div>
        </header>
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
}
