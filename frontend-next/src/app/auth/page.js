"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Megaphone, Loader2 } from 'lucide-react';
import { login, register } from '@/lib/api';

export default function Auth() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('citizen');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password, role);
      }
      // Redirect based on role
      const user = JSON.parse(localStorage.getItem('awaaz_user') || '{}');
      if (user.role === 'ngo') router.push('/ngo');
      else if (user.role === 'admin') router.push('/admin');
      else router.push('/feed');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 74px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-body)', padding: '40px 16px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '56px', height: '56px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: 'var(--shadow-sm)' }}>
            <Megaphone size={28} />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px', color: 'var(--color-text-title)', letterSpacing: '-0.02em' }}>
            {isLogin ? 'Welcome Back' : 'Join AWAAZ'}
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '15px' }}>
            {isLogin ? 'Sign in to fund, report, or manage community issues.' : 'Create an account to bring transparency to community work.'}
          </p>
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#DC2626', fontSize: '14px' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ marginBottom: '20px' }}>
              <label className="form-label">Full Name</label>
              <input type="text" placeholder="John Doe" required value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}
          
          <div style={{ marginBottom: '20px' }}>
            <label className="form-label">Email Address</label>
            <input type="email" placeholder="name@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <label className="form-label">Password</label>
            <input type="password" placeholder="••••••••" required value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          
          {!isLogin && (
            <div style={{ marginBottom: '32px' }}>
              <label className="form-label">I am registering as a:</label>
              <select value={role} onChange={e => setRole(e.target.value)} required>
                <option value="citizen">Concerned Citizen / Reporter</option>
                <option value="ngo">NGO / Funder</option>
                <option value="volunteer">Volunteer / Contractor</option>
                <option value="admin">System Admin</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px 16px', fontSize: '15px' }}>
            {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</> : (isLogin ? 'Sign In to AWAAZ' : 'Create AWAAZ Account')}
          </button>
        </form>

        <div className="divider"></div>
        
        <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span style={{ color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer' }} onClick={() => { setIsLogin(!isLogin); setError(''); }}>
            {isLogin ? 'Sign up' : 'Log in'}
          </span>
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '24px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
          <ShieldCheck size={14} color="var(--color-success)" />
          Secured via JWT and enterprise encryption
        </div>
      </div>
    </div>
  );
}
