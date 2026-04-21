"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { XCircle, ArrowLeft, HelpCircle } from 'lucide-react';

export default function PaymentCancel() {
  const router = useRouter();

  return (
    <div style={{ maxWidth: '500px', margin: '100px auto', padding: '0 20px', textAlign: 'center' }}>
      <div className="card" style={{ padding: '48px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
        <div style={{ width: '80px', height: '80px', background: '#FFF1F2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <XCircle size={40} color="var(--color-danger)" />
        </div>
        
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text-title)', marginBottom: '12px' }}>
          Payment Cancelled
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px', lineHeight: 1.6 }}>
          Your transaction was not completed. No funds have been deducted from your account.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button className="btn btn-primary" onClick={() => router.push('/feed')} style={{ width: '100%', gap: '8px' }}>
             Retry Funding
          </button>
          <button className="btn btn-light" onClick={() => router.push('/')} style={{ width: '100%', gap: '8px' }}>
            <ArrowLeft size={18} /> Back to Home
          </button>
        </div>

        <div style={{ marginTop: '32px', padding: '16px', borderRadius: '12px', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}>
          <HelpCircle size={20} color="var(--color-text-muted)" />
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
            Need help? Contact our support team at <span style={{ fontWeight: 600 }}>support@awaaz.local</span>
          </p>
        </div>
      </div>
    </div>
  );
}
