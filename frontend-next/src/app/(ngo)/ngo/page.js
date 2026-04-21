"use client";
import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, Flame, Users, TrendingUp, HandCoins, Loader2 } from 'lucide-react';
import { getProjects, getCurrentUser } from '@/lib/api';
import Link from 'next/link';

export default function NGODashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = getCurrentUser();
    setUser(u);
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const allProjects = await getProjects();
      setProjects(allProjects);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <Loader2 size={48} className="spin" color="var(--color-primary)" />
      </div>
    );
  }

  // Filter projects where this NGO has contributed
  const myProjects = projects.filter(p => 
    p.funders.some(f => f.ngo?._id === user?.id || f.ngo === user?.id)
  );

  const totalDeployed = myProjects.reduce((sum, p) => {
    const myContr = p.funders
      .filter(f => f.ngo?._id === user?.id || f.ngo === user?.id)
      .reduce((s, f) => s + f.amount, 0);
    return sum + myContr;
  }, 0);

  const completedCount = myProjects.filter(p => p.status === 'Completed').length;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
         <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text-title)', letterSpacing: '-0.02em', marginBottom: '8px' }}>Organisation Dashboard</h1>
         <p style={{ fontSize: '15px', color: 'var(--color-text-muted)' }}>Welcome back, {user?.name}. Manage your transparent funding and active AWAAZ initiatives.</p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--color-success)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p className="stat-label">Total Deployed</p>
              <p className="stat-value" style={{ color: 'var(--color-success)' }}>${totalDeployed.toLocaleString()}</p>
            </div>
            <HandCoins size={24} color="var(--color-success)" />
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
             <div>
                <p className="stat-label">Projects Supported</p>
                <p className="stat-value">{myProjects.length}</p>
             </div>
             <Flame size={24} color="var(--color-primary)" />
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #64748B' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p className="stat-label">Completed</p>
              <p className="stat-value">{completedCount}</p>
            </div>
            <CheckCircle size={24} color="#64748B" />
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #B45309' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p className="stat-label">AWAAZ Trust Score</p>
              <p className="stat-value" style={{ color: '#B45309' }}>{(95 + (completedCount * 0.5)).toFixed(1)}</p>
            </div>
            <TrendingUp size={24} color="#B45309" />
          </div>
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-title)' }}>Active Capital Allocations</h3>
          <div style={{ display: 'flex', gap: '12px' }}>
             <button className="btn btn-outline-blue" style={{ padding: '6px 12px', fontSize: '13px' }}>Download CSV Report</button>
             <button className="btn btn-light" style={{ padding: '6px 12px', fontSize: '13px' }}>View Ledger</button>
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Status</th>
              <th>Milestone Progress</th>
              <th>Latest Update</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {myProjects.map((p, idx) => {
              const percent = Math.min(100, Math.floor((p.fundingRaised / p.fundingGoal) * 100));
              const completedMilestones = p.milestones.filter(m => m.completed).length;
              const totalMilestones = p.milestones.length;
              const progressPct = totalMilestones > 0 ? Math.floor((completedMilestones / totalMilestones) * 100) : 0;
              
              return (
                <tr key={idx}>
                  <td style={{ fontWeight: 600, color: 'var(--color-text-title)' }}>{p.problem?.title}</td>
                  <td>
                    <span className={`badge ${p.status === 'Completed' ? 'badge-green' : p.status === 'In Progress' ? 'badge-blue' : 'badge-amber'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="progress-bar" style={{ width: '80px' }}><div className="progress-fill" style={{ width: `${progressPct}%` }}></div></div>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{progressPct}%</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} /> {new Date(p.updatedAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <Link href={`/project/${p.problem?._id}`}>
                      <button className="btn btn-outline-blue" style={{ padding: '6px 12px', fontSize: '12px' }}>View Detail</button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {myProjects.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No active allocations found. Start by funding a project from the explore feed.
          </div>
        )}
      </div>
      <style jsx>{`
        .spin {
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
