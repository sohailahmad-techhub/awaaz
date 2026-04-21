"use client";
import React, { useState, useEffect } from 'react';
import { MapPin, Clock, MessageSquare, ThumbsUp, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getProblems, upvoteProblem } from '@/lib/api';

const DynamicMap = dynamic(() => import('@/components/Map'), { ssr: false });

// Helper: how long ago was a date
function timeAgo(dateStr) {
  if (!dateStr) return 'Recently';
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// Fallback demo data shown if DB has no entries yet
const DEMO_PROBLEMS = [
  {
    _id: 'demo-1',
    title: 'Broken Main Water Pipe in Sector G',
    location: 'Sector G, Mardan',
    description: 'The main waterline has been leaking for 3 days causing water shortage in 50+ households.',
    urgency: 'Critical',
    category: 'Water Supply',
    upvotes: 142,
    status: 'Seeking Funds',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    aiVerification: { verified: true, score: 98, reason: 'High confidence match' },
    image: 'https://images.unsplash.com/photo-1541888087406-88096cbee266?w=600&q=80',
    coordinates: { lat: 34.2006, lng: 72.0404 }
  }
];

export default function Feed() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('trending');
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProblems();
  }, []);

  async function loadProblems() {
    try {
      const data = await getProblems();
      setProblems(data.length > 0 ? data : DEMO_PROBLEMS);
      setError('');
    } catch (err) {
      setProblems(DEMO_PROBLEMS);
      setError('Live feed unavailable. Showing verified community archive.');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpvote(id) {
    if (id.startsWith('demo-')) return;
    try {
      const updated = await upvoteProblem(id);
      setProblems(prev => prev.map(p => p._id === id ? { ...p, upvotes: updated.upvotes } : p));
    } catch {
      // Silently ignore upvote errors
    }
  }

  // Tab filtering
  const filtered = problems.filter(p => {
    if (activeTab === 'funded') return p.status === 'Funded' || p.status === 'In Progress' || p.status === 'Completed';
    return true;
  }).sort((a, b) => activeTab === 'recent'
    ? new Date(b.createdAt) - new Date(a.createdAt)
    : b.upvotes - a.upvotes
  );

  // Prepare coordinates for map
  const mapProblems = filtered
    .filter(p => p.coordinates?.lat)
    .map(p => ({
      id: p._id,
      title: p.title,
      location: p.location,
      coordinates: [p.coordinates.lat, p.coordinates.lng]
    }));

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-title)', letterSpacing: '-0.01em' }}>Explore Issues</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '15px', marginTop: '4px' }}>Discover and support community-verified problems.</p>
        </div>
        <button className="btn btn-primary" onClick={() => router.push('/post')}>Report Issue</button>
      </div>

      {error && (
        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', color: '#B45309', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <div style={{ marginBottom: '32px' }}>
        <DynamicMap problems={mapProblems} />
      </div>

      <div className="screen-nav" style={{ marginBottom: '24px' }}>
        <button className={`screen-btn ${activeTab === 'trending' ? 'active' : ''}`} onClick={() => setActiveTab('trending')}>Trending 🔥</button>
        <button className={`screen-btn ${activeTab === 'recent' ? 'active' : ''}`} onClick={() => setActiveTab('recent')}>Recent 🕒</button>
        <button className={`screen-btn ${activeTab === 'funded' ? 'active' : ''}`} onClick={() => setActiveTab('funded')}>Funded 💰</button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0', color: 'var(--color-text-muted)' }}>
          <Loader2 size={32} className="spin" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {filtered.map((problem) => (
            <div key={problem._id} className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span className={`badge ${problem.urgency === 'Critical' ? 'badge-red' : 'badge-amber'}`}>
                      {problem.urgency}
                    </span>
                    <span className="badge badge-gray">{problem.category}</span>
                    {problem.status !== 'Reported' && <span className="badge badge-blue">{problem.status}</span>}
                  </div>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} /> {timeAgo(problem.createdAt)}
                  </span>
                </div>

                <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-text-title)', letterSpacing: '-0.01em' }}>{problem.title}</h2>
                <p style={{ fontSize: '14px', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', fontWeight: 500 }}>
                  <MapPin size={16} /> {problem.location}
                </p>
                <p style={{ fontSize: '15px', lineHeight: 1.6, marginBottom: '20px', color: 'var(--color-text-body)' }}>{problem.description}</p>
                
                {problem.image && (
                  <div style={{ height: '240px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '20px', background: '#f1f5f9' }}>
                    <img src={problem.image} alt={problem.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}

                <div className="divider" style={{ margin: '20px 0' }}></div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '20px', color: 'var(--color-text-muted)' }}>
                    <button 
                      onClick={() => handleUpvote(problem._id)}
                      style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'inherit', fontSize: '14px', fontWeight: 500, transition: 'color 0.2s ease' }}
                      onMouseOver={e => e.currentTarget.style.color = 'var(--color-primary)'}
                      onMouseOut={e => e.currentTarget.style.color = 'inherit'}
                    >
                      <ThumbsUp size={18} /> {problem.upvotes}
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {problem.aiVerification?.verified && (
                      <span className="badge badge-green" title={problem.aiVerification.reason} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ShieldCheck size={14} /> AI Verified
                      </span>
                    )}
                    <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => router.push(`/project/${problem._id}`)}>
                      View Case
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-text-muted)' }}>
              <p>No issues found matching this filter.</p>
            </div>
          )}
        </div>
      )}
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
