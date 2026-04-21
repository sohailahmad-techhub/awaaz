"use client";
import React, { useState, useEffect } from 'react';
import { Star, MapPin, CheckCircle, Clock, ShieldCheck, Loader2, AlertCircle, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getMyProfile, getCurrentUser, logout } from '@/lib/api';

function timeAgo(dateStr) {
  if (!dateStr) return 'Recently';
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const STATUS_BADGE = {
  Reported:      'badge-gray',
  'Seeking Funds': 'badge-amber',
  Funded:        'badge-blue',
  'In Progress': 'badge-blue',
  Resolved:      'badge-green',
};

export default function UserProfile() {
  const router = useRouter();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) { router.push('/auth'); return; }
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const data = await getMyProfile();
      setProfileData(data);
    } catch (err) {
      setError(err.message || 'Could not load profile.');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    logout();
    router.push('/auth');
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <Loader2 size={48} color="var(--color-primary)" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '600px', margin: '60px auto', textAlign: 'center' }}>
        <AlertCircle size={40} color="var(--color-danger)" style={{ marginBottom: '16px' }} />
        <p style={{ color: 'var(--color-danger)', marginBottom: '24px' }}>{error}</p>
        <button className="btn btn-primary" onClick={() => router.push('/auth')}>Sign In</button>
      </div>
    );
  }

  const { user, stats, problems } = profileData;
  const initials = user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const roleLabel = { citizen: 'Citizen Reporter', ngo: 'NGO / Funder', volunteer: 'Volunteer', admin: 'System Admin' }[user.role] || user.role;

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto' }}>
      {/* Profile Header */}
      <div className="card" style={{ padding: '32px', marginBottom: '32px', display: 'flex', gap: '24px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <div style={{ width: '88px', height: '88px', fontSize: '28px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: 700, boxShadow: 'var(--shadow-sm)', flexShrink: 0 }}>
            {initials}
          </div>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '6px', color: 'var(--color-text-title)', letterSpacing: '-0.01em' }}>{user.name}</h1>
            <p style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', fontSize: '14px' }}>
              {user.email}
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Star size={13} /> AWAAZ Score: {stats.trustScore}
              </span>
              <span className="badge badge-blue">{roleLabel}</span>
              {stats.accuracy === 100 && (
                <span className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={13} /> 100% Accuracy
                </span>
              )}
            </div>
          </div>
        </div>
        <button className="btn btn-light" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
        <div className="stat-card" style={{ borderTop: '4px solid var(--color-primary)' }}>
          <p className="stat-label">Reported Issues</p>
          <p className="stat-value">{stats.totalReports}</p>
        </div>
        <div className="stat-card" style={{ borderTop: '4px solid var(--color-success)' }}>
          <p className="stat-label">AI Verified Accuracy</p>
          <p className="stat-value" style={{ color: 'var(--color-success)' }}>
            {stats.totalReports > 0 ? `${stats.accuracy}%` : '—'}
          </p>
        </div>
        <div className="stat-card" style={{ borderTop: '4px solid #64748B' }}>
          <p className="stat-label">Problems Resolved</p>
          <p className="stat-value">{stats.resolvedCount}</p>
        </div>
      </div>

      {/* Activity Log */}
      <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', color: 'var(--color-text-title)' }}>
        My Activity Log
      </h3>

      {problems.length === 0 ? (
        <div className="card" style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <AlertCircle size={32} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
          <p style={{ marginBottom: '16px' }}>You haven't reported any issues yet.</p>
          <button className="btn btn-primary" onClick={() => router.push('/post')}>Report Your First Issue</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {problems.map(p => (
            <div
              key={p._id}
              className="card"
              style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s ease', cursor: 'pointer' }}
              onClick={() => router.push(`/project/${p._id}`)}
              onMouseOver={e => e.currentTarget.style.transform = 'translateX(4px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'none'}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-title)', marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.title}
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={13} />
                  {timeAgo(p.createdAt)} · {p.category}
                  {p.aiVerification?.verified && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: 'var(--color-success)', fontWeight: 600 }}>
                      <ShieldCheck size={12} /> AI Verified
                    </span>
                  )}
                </p>
              </div>
              <span className={`badge ${STATUS_BADGE[p.status] || 'badge-gray'}`} style={{ marginLeft: '16px', flexShrink: 0 }}>
                {p.status === 'Resolved' && <CheckCircle size={12} style={{ marginRight: '4px' }} />}
                {p.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
