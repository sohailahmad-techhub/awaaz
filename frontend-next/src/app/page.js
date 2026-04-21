"use client";
import { useRouter } from 'next/navigation';
import { ShieldCheck, MapPin, Search, ArrowRight, Layers, FileCheck } from 'lucide-react';

export default function Landing() {
  const router = useRouter();

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 32px' }}>

      {/* Hero Section */}
      <div style={{ textAlign: 'center', maxWidth: '840px', margin: '0 auto 80px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: 'var(--radius-full)', fontSize: '13px', fontWeight: 600, border: '1px solid #BFDBFE', marginBottom: '32px' }}>
          <ShieldCheck size={16} /> Verified Decentralized Platform
        </div>
        <h1 style={{ fontSize: '56px', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '24px', color: 'var(--color-text-title)' }}>
          Give your community an <br />
          <span style={{ color: 'var(--color-primary)' }}>AWAAZ</span>.
        </h1>
        <p style={{ fontSize: '20px', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '40px', maxWidth: '640px', margin: '0 auto 40px' }}>
          Report infrastructure problems, gather community support, and secure direct NGO funding. Verified by AI, secured by transparency.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button className="btn btn-primary" style={{ padding: '14px 36px', fontSize: '16px', borderRadius: 'var(--radius-full)' }} onClick={() => router.push('/post')}>
            Report an Issue <ArrowRight size={18} />
          </button>
          <button className="btn btn-light" style={{ padding: '14px 36px', fontSize: '16px', borderRadius: 'var(--radius-full)' }} onClick={() => router.push('/feed')}>
            Explore Cases
          </button>
        </div>
      </div>

      {/* Trust Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', marginTop: '80px' }}>
        <div className="card" style={{ padding: '40px' }}>
          <div style={{ width: '56px', height: '56px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
            <Search size={28} />
          </div>
          <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '12px', color: 'var(--color-text-title)' }}>AI Fraud Detection</h3>
          <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6, fontSize: '15px' }}>
            Every submitted image and description passes through AI vision models to ensure reports are real, preventing spam and identical duplicates.
          </p>
        </div>

        <div className="card" style={{ padding: '40px' }}>
          <div style={{ width: '56px', height: '56px', background: 'var(--color-success-light)', color: 'var(--color-success)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
            <FileCheck size={28} />
          </div>
          <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '12px', color: 'var(--color-text-title)' }}>Direct Traceability</h3>
          <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6, fontSize: '15px' }}>
            NGOs fund community-approved projects. Blockchain-style ledgers trace every dollar directly to the local contractors repairing the issue.
          </p>
        </div>

        <div className="card" style={{ padding: '40px' }}>
          <div style={{ width: '56px', height: '56px', background: 'var(--color-warning-light)', color: '#B45309', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
            <Layers size={28} />
          </div>
          <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '12px', color: 'var(--color-text-title)' }}>Decentralized Triage</h3>
          <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6, fontSize: '15px' }}>
            The community upvotes the most severe problems based on geographic proximity. Critical infrastructure issues automatically escalate.
          </p>
        </div>
      </div>

    </div>
  );
}
