"use client";
import React from 'react';
import { 
  Camera, ShieldCheck, HandHeart, 
  History, ArrowRight, Zap, 
  Users, Globe, CheckCircle 
} from 'lucide-react';
import Link from 'next/link';

export default function HowItWorks() {
  const steps = [
    {
      title: "Citizen Reporting",
      desc: "Anyone can report a community issue (broken road, water leak, unsafe hazard) with a photo and location.",
      icon: <Camera size={32} color="var(--color-primary)" />,
      badge: "Step 1"
    },
    {
      title: "AI Verification",
      desc: "Our AI analysis engine verifies the visual proof in real-time to prevent fake reports and ensure authenticity.",
      icon: <Zap size={32} color="#F59E0B" />,
      badge: "Step 2"
    },
    {
      title: "NGO Adoption",
      desc: "Verified NGOs and Funders adopt the issues, set funding goals, and deploy capital directly into the project.",
      icon: <HandHeart size={32} color="var(--color-success)" />,
      badge: "Step 3"
    },
    {
      title: "Blockchain Ledger",
      desc: "Every transaction is recorded on our immutable ledger. Funds are released only when milestones are proven.",
      icon: <History size={32} color="#6366F1" />,
      badge: "Step 4"
    }
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '80px' }}>
        <h1 style={{ fontSize: '48px', fontWeight: 800, color: 'var(--color-text-title)', letterSpacing: '-0.04em', marginBottom: '20px' }}>
           The AWAAZ Ecosystem
        </h1>
        <p style={{ fontSize: '20px', color: 'var(--color-text-muted)', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
           Bridging the gap between community needs and capital deployment through radical transparency.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '40px', marginBottom: '80px' }}>
        {steps.map((step, idx) => (
          <div key={idx} className="card" style={{ padding: '40px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '12px', fontWeight: 800, color: 'var(--color-primary)', background: 'var(--color-primary-light)', padding: '4px 12px', borderRadius: '20px' }}>
               {step.badge}
            </div>
            <div style={{ width: '64px', height: '64px', background: 'var(--color-bg)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
               {step.icon}
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text-title)', marginBottom: '12px' }}>{step.title}</h3>
            <p style={{ color: 'var(--color-text-body)', fontSize: '15px', lineHeight: 1.6 }}>{step.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--color-primary)', borderRadius: '24px', padding: '60px', color: 'white', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.4)' }}>
         <Globe size={48} style={{ margin: '0 auto 24px', opacity: 0.8 }} />
         <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px' }}>Ready to make an impact?</h2>
         <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '40px', maxWidth: '500px', margin: '0 auto 40px' }}>
            Join a growing network of citizens and NGOs working together to build better communities everywhere.
         </p>
         <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <Link href="/auth">
              <button className="btn" style={{ background: 'white', color: 'var(--color-primary)', padding: '16px 32px', fontWeight: 700, fontSize: '16px' }}>
                 Create Account
              </button>
            </Link>
            <Link href="/feed">
              <button className="btn btn-outline-white" style={{ padding: '16px 32px', fontWeight: 700, fontSize: '16px', border: '2px solid rgba(255,255,255,0.3)', color: 'white' }}>
                 Explore Issues
              </button>
            </Link>
         </div>
      </div>

      <div style={{ marginTop: '80px', display: 'flex', justifyContent: 'center', gap: '40px' }}>
         <div style={{ textAlign: 'center' }}>
            <CheckCircle size={24} color="var(--color-success)" style={{ margin: '0 auto 8px' }} />
            <p style={{ fontSize: '14px', fontWeight: 600 }}>100% Transparent</p>
         </div>
         <div style={{ textAlign: 'center' }}>
            <ShieldCheck size={24} color="var(--color-success)" style={{ margin: '0 auto 8px' }} />
            <p style={{ fontSize: '14px', fontWeight: 600 }}>AI Verified</p>
         </div>
         <div style={{ textAlign: 'center' }}>
            <Users size={24} color="var(--color-success)" style={{ margin: '0 auto 8px' }} />
            <p style={{ fontSize: '14px', fontWeight: 600 }}>Community Led</p>
         </div>
      </div>
    </div>
  );
}
