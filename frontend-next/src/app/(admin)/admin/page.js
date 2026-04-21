"use client";
import React, { useState, useEffect, Suspense } from 'react';
import {
  AlertCircle, Trash2, CheckCircle, Activity, LayoutDashboard,
  BrainCircuit, ShieldAlert, Loader2, Users, RefreshCw, 
  Rocket, History as HistoryIcon, Settings2, ExternalLink,
  Save, User as UserIcon, Mail
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  getFlaggedProblems, getProblems, getProjects, getAllUsers, 
  approveProblem, deleteProblem, getCurrentUser, getLedger,
  updateProfile
} from '@/lib/api';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)    return 'Just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function AdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'overview';

  const [loading, setLoading]   = useState(true);
  const [flagged, setFlagged]   = useState([]);
  const [projects, setProjects] = useState([]);
  const [ledger, setLedger]     = useState([]);
  const [stats, setStats]       = useState({ users: 0, reports: 0, flaggedCount: 0, projects: 0 });
  const [actionMsg, setActionMsg] = useState('');
  
  // Profile settings state
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
      router.push('/auth');
      return;
    }
    setProfile({ name: user.name || '', email: user.email || '' });
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [allProblems, allProjects, allUsers, flaggedList, ledgerData] = await Promise.all([
        getProblems(),
        getProjects(),
        getAllUsers(),
        getFlaggedProblems(),
        getLedger()
      ]);
      setFlagged(flaggedList);
      setProjects(allProjects);
      setLedger(ledgerData);
      setStats({
        users: allUsers.length,
        reports: allProblems.length,
        flaggedCount: flaggedList.length,
        projects: allProjects.length,
      });
    } catch (err) {
      console.error('Admin fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id) {
    try {
      await approveProblem(id);
      setFlagged(prev => prev.filter(p => p._id !== id));
      setActionMsg('✅ Problem approved and verified.');
      setTimeout(() => setActionMsg(''), 3000);
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this problem permanently?')) return;
    try {
      await deleteProblem(id);
      setFlagged(prev => prev.filter(p => p._id !== id));
      setStats(prev => ({ ...prev, reports: prev.reports - 1, flaggedCount: prev.flaggedCount - 1 }));
      setActionMsg('🗑️ Problem deleted.');
      setTimeout(() => setActionMsg(''), 3000);
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile(profile);
      setActionMsg('✅ Profile updated successfully.');
      setTimeout(() => setActionMsg(''), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingProfile(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <Loader2 size={48} color="var(--color-primary)" className="animate-spin" />
      </div>
    );
  }

  const renderOverview = () => (
    <>
      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p className="stat-label">Total Users</p>
              <p className="stat-value">{stats.users.toLocaleString()}</p>
            </div>
            <Users size={24} color="var(--color-primary)" />
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--color-success)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p className="stat-label">Total Reports</p>
              <p className="stat-value">{stats.reports}</p>
            </div>
            <Activity size={24} color="var(--color-success)" />
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--color-danger)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p className="stat-label">AI Flagged</p>
              <p className="stat-value" style={{ color: 'var(--color-danger)' }}>{stats.flaggedCount}</p>
            </div>
            <BrainCircuit size={24} color="var(--color-danger)" />
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #F59E0B' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p className="stat-label">Active Projects</p>
              <p className="stat-value" style={{ color: '#B45309' }}>{stats.projects}</p>
            </div>
            <ShieldAlert size={24} color="#F59E0B" />
          </div>
        </div>
      </div>

      {/* Moderation Queue */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-title)' }}>
            Moderation Queue — AI Flagged Reports
          </h3>
        </div>

        {flagged.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <CheckCircle size={32} color="var(--color-success)" style={{ margin: '0 auto 16px' }} />
            <p style={{ fontWeight: 600 }}>All clear! No flagged reports at this time.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Reporter</th>
                <th>Issue Title</th>
                <th>AI Reason</th>
                <th>Score</th>
                <th>Reported</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {flagged.map(p => (
                <tr key={p._id}>
                  <td style={{ fontWeight: 500 }}>
                    {p.reportedBy?.name || 'Unknown'}
                    <br />
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{p.reportedBy?.email}</span>
                  </td>
                  <td style={{ color: 'var(--color-text-title)', maxWidth: '200px' }}>
                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.title}
                    </span>
                    <span className={`badge ${p.urgency === 'Critical' ? 'badge-red' : 'badge-amber'}`} style={{ marginTop: '4px' }}>
                      {p.urgency}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${p.aiVerification?.verified ? 'badge-amber' : 'badge-red'}`}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', maxWidth: '220px', whiteSpace: 'normal', lineHeight: 1.4 }}
                    >
                      <AlertCircle size={13} />
                      {p.aiVerification?.reason || 'AI flagged'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: p.aiVerification?.score < 40 ? 'var(--color-danger)' : '#B45309' }}>
                      {p.aiVerification?.score ?? '—'}/100
                    </span>
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                    {timeAgo(p.createdAt)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn btn-light"
                        style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '4px' }}
                        onClick={() => handleDelete(p._id)}
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                      <button
                        className="btn btn-outline-blue"
                        style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        onClick={() => handleApprove(p._id)}
                      >
                        <CheckCircle size={13} /> Approve
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );

  const renderProjects = () => (
    <div className="card">
      <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-title)' }}>
          Active Community Projects
        </h3>
        <span className="badge badge-blue">{projects.length} Total</span>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Project</th>
            <th>NGO / Lead</th>
            <th>Progress</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map(pj => {
            const progress = pj.fundingGoal > 0 ? (pj.fundingRaised / pj.fundingGoal) * 100 : 0;
            return (
              <tr key={pj._id}>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-title)' }}>{pj.problem?.title || 'Unknown Problem'}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>ID: {pj._id.slice(-8)}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 500, color: 'var(--color-text-title)' }}>{pj.leadNgo?.name || 'Unassigned'}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{pj.leadNgo?.email}</div>
                </td>
                <td>
                  <div style={{ width: '120px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                      <span>${pj.fundingRaised.toLocaleString()}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: 'var(--color-primary)', width: `${Math.min(100, progress)}%` }}></div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`badge ${pj.status === 'Completed' ? 'badge-green' : 'badge-blue'}`}>
                    {pj.status}
                  </span>
                </td>
                <td>
                  <button className="btn btn-light" style={{ padding: '6px' }} title="View Project">
                    <ExternalLink size={14} />
                  </button>
                </td>
              </tr>
            );
          })}
          {projects.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                No projects found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderHistory = () => (
    <div className="card">
      <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-title)' }}>
          Transparency Ledger — Crypto Verification
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
          Real-time record of all funds distributed through the AWAAZ Blockchain Layer.
        </p>
      </div>
      <table className="table" style={{ fontSize: '13px' }}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Verification Hash</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {ledger.map((tx, idx) => (
            <tr key={idx}>
              <td style={{ whiteSpace: 'nowrap' }}>{new Date(tx.createdAt).toLocaleDateString()}</td>
              <td>
                <div style={{ fontWeight: 600 }}>Funding Disbursement</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Project: {tx.projectId?.problem?.title || 'Unknown'}</div>
              </td>
              <td style={{ color: 'var(--color-success)', fontWeight: 700 }}>
                +${tx.amount?.toLocaleString()}
              </td>
              <td>
                <code style={{ fontSize: '10px', background: '#F1F5F9', padding: '4px 8px', borderRadius: '4px', color: 'var(--color-text-muted)' }}>
                  {tx.blockHash ? `${tx.blockHash.slice(0, 16)}...` : 'N/A (Pending)'}
                </code>
              </td>
              <td>
                <span className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}>
                  <CheckCircle size={10} /> Verified
                </span>
              </td>
            </tr>
          ))}
          {ledger.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                No ledger history yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderSettings = () => (
    <div style={{ maxWidth: '600px' }}>
      <div className="card" style={{ padding: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-title)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Settings2 size={20} /> Account Settings
        </h3>
        
        <form onSubmit={handleSaveProfile}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-title)', marginBottom: '8px' }}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <UserIcon size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input 
                type="text" 
                value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
                placeholder="Admin Name" 
                style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid var(--color-border)' }} 
              />
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-title)', marginBottom: '8px' }}>
              Work Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input 
                type="email" 
                value={profile.email}
                onChange={e => setProfile({ ...profile, email: e.target.value })}
                placeholder="admin@awaaz.org" 
                style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid var(--color-border)' }} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={savingProfile}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {savingProfile ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Changes
            </button>
            <button type="button" className="btn btn-light">
              Cancel
            </button>
          </div>
        </form>
      </div>

      <div className="card" style={{ padding: '32px', marginTop: '24px', border: '1px solid #FEE2E2', background: '#FEF2F2' }}>
        <h4 style={{ color: '#991B1B', fontWeight: 700, marginBottom: '8px' }}>Security Zone</h4>
        <p style={{ fontSize: '14px', color: '#B91C1C', marginBottom: '16px' }}>
          Passwords must be changed every 90 days. Next rotation required in 42 days.
        </p>
        <button className="btn" style={{ background: '#991B1B', color: 'white', fontSize: '13px' }}>
          Force Password Rotation
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text-title)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
            {tab === 'overview' && 'AWAAZ System Administration'}
            {tab === 'projects' && 'Community Projects'}
            {tab === 'history' && 'Funding Ledger'}
            {tab === 'settings' && 'Admin Settings'}
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--color-text-muted)' }}>
            {tab === 'overview' && 'Manage platform integrity, review AI decisions, and oversee community activity.'}
            {tab === 'projects' && 'Oversee ongoing project implementation, milestones, and funding status.'}
            {tab === 'history' && 'Audit cryptographic records of all funds distributed across the platform.'}
            {tab === 'settings' && 'Update your administrative profile and manage system security defaults.'}
          </p>
        </div>
        <button className="btn btn-light" onClick={fetchAll} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {actionMsg && (
        <div style={{ background: '#F0FDF4', border: '1px solid #A7F3D0', borderRadius: '8px', padding: '12px 16px', marginBottom: '24px', color: '#065F46', fontSize: '14px' }}>
          {actionMsg}
        </div>
      )}

      {tab === 'overview' && renderOverview()}
      {tab === 'projects' && renderProjects()}
      {tab === 'history' && renderHistory()}
      {tab === 'settings' && renderSettings()}
      
      <style jsx global>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div>Loading Admin Center...</div>}>
      <AdminContent />
    </Suspense>
  );
}

