"use client";
import React, { useState, useEffect, use } from 'react';
import { ArrowLeft, Share2, MapPin, ShieldCheck, FileCheck, CircleDollarSign, CheckSquare, MessageSquare, HandHeart, Users, Loader2, AlertCircle, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getProjectByProblem, fundProject, addMilestone, createProject, getCurrentUser, createCheckoutSession } from '@/lib/api';


export default function ProjectDetail({ params }) {
  const router = useRouter();
  const { id: problemId } = use(params);
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [user, setUser] = useState(null);
  const [fundAmount, setFundAmount] = useState(100);

  useEffect(() => {
    setUser(getCurrentUser());
    fetchData();
  }, [problemId]);

  async function fetchData() {
    setLoading(true);
    try {
      // The ID passed here is actually the Problem ID from the feed
      const data = await getProjectByProblem(problemId);
      setProject(data);
    } catch (err) {
      // If project not found, we might still want to show the problem?
      // For now, if project doesn't exist, we'll handle it in the UI
      setError(err.message === 'Project not found' ? '' : err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdopt() {
    try {
      setLoading(true);
      const goal = prompt("Enter funding goal for this project ($):", "1500");
      if (!goal) return;
      
      const newProject = await createProject(problemId, parseInt(goal));
      setProject(newProject);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleFund() {
    if (!project) return;
    try {
      setLoading(true);
      const { url } = await createCheckoutSession(project._id, fundAmount);
      // Redirect to Stripe
      window.location.href = url;
    } catch (err) {
      alert(err.message || 'Payment failed to initiate.');
      setLoading(false);
    }
  }

  async function handleAddUpdate() {
    if (!project) return;
    const title = prompt("Enter milestone title:");
    if (!title) return;
    try {
      const updated = await addMilestone(project._id, { title, proofImage: 'https://images.unsplash.com/photo-1541888087406-88096cbee266?w=400&q=80' });
      setProject(updated);
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <Loader2 size={48} className="spin" color="var(--color-primary)" />
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center' }}>
        <AlertCircle size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 24px' }} />
        <h2 style={{ marginBottom: '12px' }}>Project Not Initiated</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px' }}>
          This reported issue has been verified but hasn't been adopted as a project yet.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button className="btn btn-light" onClick={() => router.push('/feed')}>Back to Feed</button>
          {user?.role === 'ngo' && (
            <button className="btn btn-primary" onClick={handleAdopt}>Adopt & Set Funding Goal</button>
          )}
        </div>
      </div>
    );
  }

  const problem = project.problem;
  const percent = Math.min(100, Math.floor((project.fundingRaised / project.fundingGoal) * 100));

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 32px' }}>
      <button 
        onClick={() => router.back()} 
        className="btn btn-light"
        style={{ padding: '8px 16px', fontSize: '13px', borderRadius: 'var(--radius-full)', marginBottom: '32px' }}
      >
        <ArrowLeft size={14} /> Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '40px' }}>
        <div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <span className={`badge ${problem.urgency === 'Critical' ? 'badge-red' : 'badge-amber'}`}>
              {problem.urgency} Priority
            </span>
            <span className="badge badge-gray">{problem.category}</span>
            <span className="badge badge-blue">Verified Issue</span>
          </div>

          <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-text-title)', letterSpacing: '-0.02em', marginBottom: '16px' }}>
            {problem.title}
          </h1>
          
          <p style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-body)', fontSize: '15px', marginBottom: '32px', fontWeight: 500 }}>
            <MapPin size={18} color="var(--color-primary)" /> {problem.location}
          </p>

          <div className="screen-nav" style={{ marginBottom: '24px' }}>
             <button className={`screen-btn ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>Details & Evidence</button>
             <button className={`screen-btn ${activeTab === 'progress' ? 'active' : ''}`} onClick={() => setActiveTab('progress')}>Progress Updates</button>
          </div>

          {activeTab === 'details' && (
            <>
              <div style={{ height: '400px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '32px', boxShadow: 'var(--shadow-md)', background: '#f8fafc' }}>
                <img src={problem.image} alt={problem.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              <div className="trust-section" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
                <div style={{ width: '48px', height: '48px', background: '#D1FAE5', color: 'var(--color-success)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <ShieldCheck size={28} />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '16px', color: 'var(--color-text-title)', marginBottom: '4px' }}>AI Verified Proof</p>
                  <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>{problem.aiVerification?.reason || 'Verified authenticity.'}</p>
                </div>
              </div>

              <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-title)', marginBottom: '16px' }}>Situation Context</h3>
              <p style={{ color: 'var(--color-text-body)', lineHeight: 1.7, marginBottom: '32px', fontSize: '16px' }}>
                {problem.description}
              </p>

              <div className="divider"></div>

              <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-title)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <CheckSquare size={20} color="var(--color-primary)" /> Execution Milestones
              </h3>
              <div style={{ paddingLeft: '12px', borderLeft: '2px solid var(--color-border)', marginLeft: '8px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                 {project.milestones.map((m, idx) => (
                   <div key={idx} style={{ opacity: m.completed ? 1 : 0.6 }}>
                      <p style={{ fontWeight: 600, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {m.completed ? <CheckCircle size={16} color="var(--color-success)" /> : <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #ccc' }} />}
                        {idx + 1}. {m.title}
                      </p>
                      {m.updatedAt && <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginLeft: '24px' }}>Completed on {new Date(m.updatedAt).toLocaleDateString()}</p>}
                   </div>
                 ))}
                 {user?.role !== 'citizen' && (
                   <button className="btn btn-light" style={{ padding: '6px 12px', width: 'fit-content', fontSize: '13px' }} onClick={handleAddUpdate}>
                     <Plus size={14} /> Add Milestone
                   </button>
                 )}
              </div>
            </>
          )}

          {activeTab === 'progress' && (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
               {project.milestones.filter(m => m.completed).map((m, idx) => (
                 <div key={idx} className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <h4 style={{ fontWeight: 700 }}>{m.title}</h4>
                      <span className="badge badge-green">Verified Update</span>
                    </div>
                    {m.proofImage && (
                      <div style={{ height: '200px', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
                        <img src={m.proofImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Updated on {new Date(m.updatedAt).toLocaleString()}</p>
                 </div>
               ))}
               {project.milestones.filter(m => m.completed).length === 0 && (
                 <p style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>No progress updates yet.</p>
               )}
             </div>
          )}
        </div>

        <div>
          <div className="card" style={{ padding: '32px', position: 'sticky', top: '100px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <div style={{ width: '64px', height: '64px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <CircleDollarSign size={32} />
              </div>
            </div>
            
            <h3 style={{ fontSize: '20px', fontWeight: 700, textAlign: 'center', marginBottom: '8px', color: 'var(--color-text-title)' }}>Transparent Funding</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', textAlign: 'center', marginBottom: '32px', lineHeight: 1.5 }}>
              Funds are held on Awaaz and released strictly upon verified milestone completion.
            </p>

            <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '36px', fontWeight: 800, color: 'var(--color-text-title)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                ${project.fundingRaised.toLocaleString()}
              </span>
              <span style={{ fontSize: '14px', color: 'var(--color-text-muted)', fontWeight: 500, paddingBottom: '4px' }}>
                of ${project.fundingGoal.toLocaleString()}
              </span>
            </div>
            
            <div className="progress-bar" style={{ marginBottom: '16px', height: '10px' }}>
              <div className="progress-fill" style={{ width: `${percent}%` }}></div>
            </div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '32px', textAlign: 'right' }}>{percent}% Funded</p>

            {user?.role === 'ngo' && percent < 100 && (
              <div style={{ marginBottom: '20px' }}>
                <input 
                  type="number" 
                  value={fundAmount} 
                  onChange={e => setFundAmount(e.target.value)}
                  style={{ width: '100%', marginBottom: '12px' }}
                  placeholder="Amount to fund ($)"
                />
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }} onClick={handleFund}>
                  Fund Project Securely
                </button>
              </div>
            )}
            
            <button className="btn btn-outline-blue" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px', marginBottom: '16px' }} onClick={() => alert("You have joined as a volunteer!")}>
              <HandHeart size={18} /> Volunteer for Project
            </button>
            <button className="btn btn-light" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '15px' }}>
              <Share2 size={16} /> Share Campaign
            </button>

            <div className="divider" style={{ margin: '24px 0' }}></div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
               <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                 <FileCheck size={14} /> NGO KYC Verified
               </p>
               <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                 <Users size={14} /> {project.funders.length} Funders
               </p>
            </div>
          </div>
        </div>
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
