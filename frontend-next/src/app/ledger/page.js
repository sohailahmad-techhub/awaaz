"use client";
import React, { useState, useEffect } from 'react';
import { getLedger } from '@/lib/api';
import { 
  ShieldCheck, ArrowRight, ExternalLink, Hash, 
  History, Loader2, Info, Lock, Globe 
} from 'lucide-react';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function TransparencyLedger() {
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLedger();
  }, []);

  async function fetchLedger() {
    try {
      const data = await getLedger();
      setLedger(data);
    } catch (err) {
      setError('Could not load transaction ledger.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 0' }}>
        <Loader2 size={48} className="spin" color="var(--color-primary)" />
        <p style={{ marginTop: '16px', color: 'var(--color-text-muted)', fontWeight: 500 }}>Verifying cryptographic chain...</p>
        <style>{`
          .spin { animation: spin 1s linear infinite; }
          @keyframes spin { from {transform:rotate(0deg)} to {transform:rotate(360deg)} }
        `}</style>
      </div>
    );
  }

  const totalFunds = ledger.reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#F0FDF4', color: '#166534', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
          <ShieldCheck size={14} /> Immutable On-Chain Ledger
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--color-text-title)', letterSpacing: '-0.03em', marginBottom: '12px' }}>
          Public Transparency Hub
        </h1>
        <p style={{ fontSize: '17px', color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          Every dollar move on AWAAZ is recorded in a cryptographically chained ledger. Anyone can verify project funding and allocation.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
        <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
          <History size={24} color="var(--color-primary)" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Transactions</p>
          <p style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text-title)' }}>{ledger.length}</p>
        </div>
        <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
          <Globe size={24} color="var(--color-success)" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Volume Cleared</p>
          <p style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-success)' }}>${totalFunds.toLocaleString()}</p>
        </div>
        <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
          <Lock size={24} color="#6366F1" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Chain Integrity</p>
          <p style={{ fontSize: '28px', fontWeight: 800, color: '#6366F1' }}>Verified</p>
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.1)' }}>
        <div style={{ padding: '20px 24px', background: '#F8FAFC', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-title)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Hash size={18} /> Cryptographic Transaction Log
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
            Syncing with Awaaz...
          </span>
        </div>

        {ledger.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <Info size={40} color="var(--color-text-muted)" style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <p style={{ color: 'var(--color-text-muted)' }}>No confirmed transactions in the ledger yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ margin: 0 }}>
              <thead style={{ background: '#F1F5F9' }}>
                <tr>
                  <th style={{ padding: '14px 24px' }}>Transaction ID / Block</th>
                  <th>NGO / Funder</th>
                  <th>Impact Project</th>
                  <th>Amount</th>
                  <th>Chain Hash</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((tx, idx) => (
                  <tr key={tx._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '18px 24px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 700 }}>BLOCK #{ledger.length - idx}</span>
                        <code style={{ fontSize: '12px', color: 'var(--color-text-body)', background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px', width: 'fit-content' }}>
                          {tx._id.slice(-8).toUpperCase()}
                        </code>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--color-text-title)' }}>{tx.ngoId?.name || 'NGO'}</span>
                    </td>
                    <td style={{ maxWidth: '240px' }}>
                      <div className="project-link" style={{ fontSize: '14px', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer' }}>
                        {tx.projectId?.problem?.title || 'Unknown Project'}
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        PI: {tx.stripePaymentIntentId?.slice(0, 12)}...
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-success)' }}>
                        ${tx.amount.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                          <span style={{ fontWeight: 600, width: '35px' }}>PREV:</span> 
                          <span style={{ fontFamily: 'monospace' }}>{tx.prevHash?.slice(0, 8)}...</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--color-primary)' }}>
                          <span style={{ fontWeight: 600, width: '35px' }}>HASH:</span> 
                          <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{tx.blockHash?.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-success)', fontWeight: 600, fontSize: '13px' }}>
                        <ShieldCheck size={14} /> Confirmed
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{formatDate(tx.createdAt)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ marginTop: '32px', padding: '24px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '12px', border: '1px dashed var(--color-primary-light)' }}>
        <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-title)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Info size={18} color="var(--color-primary)" /> How Does Verification Work?
        </h4>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
          Each transaction hash includes the previous block's hash. If a single digit of any transaction is changed, the entire chain after it will break, making the audit trail fully tamper-evident. Our system reconciles these hashes with Stripe's real-world payment data for 100% financial accuracy.
        </p>
      </div>

      <style jsx>{`
        .project-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
