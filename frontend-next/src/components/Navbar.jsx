"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Megaphone, Bell, LogOut, User, History } from 'lucide-react';
import { useEffect, useState } from 'react';
import { logout, getCurrentUser } from '@/lib/api';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  function handleLogout() {
    logout();
    setUser(null);
    router.push('/');
  }

  function dashboardLink() {
    if (!user) return '/auth';
    if (user.role === 'ngo') return '/ngo';
    if (user.role === 'admin') return '/admin';
    return '/profile';
  }

  return (
    <div className="nav">
      <Link href="/" className="logo" style={{ textDecoration: 'none' }}>
        <div className="logo-icon"><Megaphone size={16} strokeWidth={2.5} /></div>
        AWAAZ
      </Link>
      <div className="nav-links">
        <Link href="/feed" style={{ textDecoration: 'none', color: 'inherit' }}><span>Explore Issues</span></Link>
        <Link href="/ledger" style={{ textDecoration: 'none', color: 'inherit' }}><span style={{ color: 'var(--color-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}><History size={14} /> Transparency Ledger</span></Link>
        <Link href="/how-it-works" style={{ textDecoration: 'none', color: 'inherit' }}><span>How it Works</span></Link>
        <Link href={user?.role === 'ngo' ? '/ngo' : '/auth'} style={{ textDecoration: 'none', color: 'inherit' }}><span>For NGOs</span></Link>
      </div>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        {/* Notification Bell */}
        <div style={{ position: 'relative', cursor: 'pointer', color: 'var(--color-text-muted)' }}
          onMouseOver={e => e.currentTarget.style.color = 'var(--color-text-title)'}
          onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-muted)'}>
          <Bell size={20} />
          <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', background: 'var(--color-danger)', borderRadius: '50%', border: '2px solid var(--color-bg-card)' }}></span>
        </div>

        {user ? (
          /* Logged-in state */
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="btn btn-light" style={{ gap: '8px' }} onClick={() => router.push(dashboardLink())}>
              <User size={16} />
              {user.name?.split(' ')[0]}
            </button>
            <button className="btn btn-light" style={{ padding: '8px 12px', color: 'var(--color-danger)' }} onClick={handleLogout} title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          /* Logged-out state */
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-light" onClick={() => router.push('/auth')}>Sign In</button>
            <button className="btn btn-primary" onClick={() => router.push('/auth')}>Join AWAAZ</button>
          </div>
        )}
      </div>
    </div>
  );
}
