"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyPaymentSession } from '@/lib/api';
import { 
  CheckCircle, Loader2, ExternalLink, ArrowRight,
  ShieldCheck, AlertCircle, Bookmark 
} from 'lucide-react';

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (sessionId) {
      verifyAndChain();
    } else {
      setError('Missing session ID.');
      setLoading(false);
    }
  }, [sessionId]);

  async function verifyAndChain() {
    try {
      const data = await verifyPaymentSession(sessionId);
      setTransaction(data.transaction);
    } catch (err) {
      setError(err.message || 'Verification failed. Please contact support if your payment was deducted.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: '600px', margin: '100px auto', textAlign: 'center' }}>
        <Loader2 size={48} className="spin" color="var(--color-primary)" style={{ margin: '0 auto 24px' }} />
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-title)', marginBottom: '12px' }}>
          Verifying Your Contribution
        </h2>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Securing your transaction on the ledger. Please do not close this window...
        </p>
        <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '500px', margin: '80px auto', textAlign: 'center', padding: '40px', background: '#FEF2F2', borderRadius: '16px', border: '1px solid #FECACA' }}>
        <AlertCircle size={48} color="var(--color-danger)" style={{ margin: '0 auto 20px' }} />
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#991B1B', marginBottom: '12px' }}>Something went wrong</h2>
        <p style={{ color: '#B91C1C', marginBottom: '24px' }}>{error}</p>
        <button className="btn btn-primary" onClick={() => router.push('/feed')} style={{ width: '100%' }}>Return to Feed</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '60px auto', padding: '0 20px' }}>
      <div className="card" style={{ padding: '48px', textAlign: 'center', boxShadow: '0 20px 40px -12px rgba(0,0,0,0.1)' }}>
        <div style={{ width: '80px', height: '80px', background: '#F0FDF4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <CheckCircle size={40} color="var(--color-success)" />
        </div>
        
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-text-title)', letterSpacing: '-0.02em', marginBottom: '12px' }}>
          Payment Successful!
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--color-text-muted)', marginBottom: '32px' }}>
          Thank you for your generous contribution. Your funding has been cryptographically secured in the AWAAZ ledger.
        </p>

        <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '24px', marginBottom: '32px', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '14px', fontWeight: 600 }}>Amount Funded</span>
            <span style={{ color: 'var(--color-success)', fontSize: '18px', fontWeight: 800 }}>${transaction.amount.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Block Hash (Immutable)</span>
            <code style={{ fontSize: '11px', color: 'var(--color-primary)', background: 'white', padding: '8px', borderRadius: '6px', border: '1px solid #E2E8F0', wordBreak: 'break-all' }}>
              {transaction.blockHash}
            </code>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button className="btn btn-primary" onClick={() => router.push('/ledger')} style={{ width: '100%', gap: '8px' }}>
            <ExternalLink size={18} /> View Transparency Ledger
          </button>
          <button className="btn btn-light" onClick={() => router.push('/feed')} style={{ width: '100%', gap: '8px' }}>
            <ArrowRight size={18} /> Back to Explore
          </button>
        </div>
        
        <div style={{ marginTop: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--color-text-muted)', fontSize: '12px' }}>
          <ShieldCheck size={14} color="var(--color-success)" /> 
          Verified by Stripe & SocialImpact Blockchain
        </div>
      </div>
    </div>
  );
}
