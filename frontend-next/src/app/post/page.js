"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, MapPin, BrainCircuit, CheckCircle, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { createProblem } from '@/lib/api';

export default function PostProblem() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Water Supply',
    urgency: 'Medium',
    location: '',
    coordinates: null,
    image: '' // base64 data URL
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [aiStatus, setAiStatus] = useState(null); // null | 'checking' | 'verified' | 'flagged'
  const [aiResult, setAiResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function update(field, val) {
    setForm(prev => ({ ...prev, [field]: val }));
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
      update('image', reader.result);
    };
    reader.readAsDataURL(file);
  }

  function getLocation() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        update('coordinates', { lat: parseFloat(lat), lng: parseFloat(lng) });
        // Only pre-fill location text if user hasn't typed anything yet
        setForm(prev => ({
          ...prev,
          coordinates: { lat: parseFloat(lat), lng: parseFloat(lng) },
          location: prev.location || `${lat}, ${lng}`
        }));
      },
      err => {
        console.warn('GPS error:', err.message);
        alert('Could not get location. Please type it manually.');
      }
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const token = localStorage.getItem('awaaz_token');
    if (!token) {
      router.push('/auth');
      return;
    }

    setSubmitting(true);
    setAiStatus('checking');

    try {
      const result = await createProblem(form);
      // Display AI result returned from backend
      const ai = result.aiVerification;
      setAiResult(ai);
      setAiStatus(ai.verified ? 'verified' : 'flagged');

      if (ai.verified) {
        setTimeout(() => router.push('/feed'), 2000);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit. Make sure you are logged in.');
      setAiStatus(null);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text-title)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
          Report a Community Issue
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '15px' }}>
          Your report will be analysed by our AI verification system before going live.
        </p>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 16px', marginBottom: '24px', color: '#DC2626', fontSize: '14px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* AI Status Banner */}
      {aiStatus === 'checking' && (
        <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', padding: '20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Loader2 size={24} color="var(--color-primary)" style={{ animation: 'spin 1s linear infinite' }} />
          <div>
            <p style={{ fontWeight: 700, color: 'var(--color-primary)' }}>AI Verification in Progress...</p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Checking image authenticity, duplicates, and metadata.</p>
          </div>
        </div>
      )}

      {aiStatus === 'verified' && aiResult && (
        <div style={{ background: '#F0FDF4', border: '1px solid #A7F3D0', borderRadius: '12px', padding: '20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <ShieldCheck size={28} color="var(--color-success)" />
          <div>
            <p style={{ fontWeight: 700, color: 'var(--color-success)' }}>✅ AI Verified — Trust Score: {aiResult.score}/100</p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{aiResult.reason}</p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Redirecting to feed in 2 seconds...</p>
          </div>
        </div>
      )}

      {aiStatus === 'flagged' && aiResult && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', padding: '20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <AlertCircle size={28} color="var(--color-danger)" />
          <div>
            <p style={{ fontWeight: 700, color: 'var(--color-danger)' }}>⚠️ AI Flagged — Score: {aiResult.score}/100</p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{aiResult.reason}</p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Your report has been submitted for admin review.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        <div>
          <label className="form-label">Issue Title *</label>
          <input type="text" placeholder="e.g. Broken water main on Main Road" required value={form.title} onChange={e => update('title', e.target.value)} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label className="form-label">Category *</label>
            <select value={form.category} onChange={e => update('category', e.target.value)}>
              <option value="Road Infrastructure">Road Infrastructure</option>
              <option value="Water Supply">Water Supply</option>
              <option value="Electricity">Electricity</option>
              <option value="Waste Management">Waste Management</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="form-label">Urgency Level *</label>
            <select value={form.urgency} onChange={e => update('urgency', e.target.value)}>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">🚨 Critical</option>
            </select>
          </div>
        </div>

        <div>
          <label className="form-label">Detailed Description *</label>
          <textarea placeholder="Describe the issue clearly. When did it start? How many people are affected? What is the risk?" rows={4} required value={form.description} onChange={e => update('description', e.target.value)} style={{ resize: 'vertical' }} />
        </div>

        <div>
          <label className="form-label">Location *</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="text" placeholder="e.g. Sector G, Mardan" required value={form.location} onChange={e => update('location', e.target.value)} style={{ flex: 1 }} />
            <button type="button" className="btn btn-light" onClick={getLocation} style={{ whiteSpace: 'nowrap', gap: '6px' }}>
              <MapPin size={16} /> Use GPS
            </button>
          </div>
          {form.coordinates && (
            <p style={{ fontSize: '12px', color: 'var(--color-success)', marginTop: '6px' }}>
              ✓ GPS: {form.coordinates.lat.toFixed(4)}, {form.coordinates.lng.toFixed(4)}
            </p>
          )}
        </div>

        <div>
          <label className="form-label">Photo / Video Evidence *</label>
          <div
            style={{ border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-md)', padding: '32px', textAlign: 'center', cursor: 'pointer', background: 'var(--color-bg-body)', transition: 'all 0.2s ease' }}
            onClick={() => document.getElementById('img-upload').click()}
            onMouseOver={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
            onMouseOut={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="preview" style={{ maxHeight: '200px', borderRadius: '8px', maxWidth: '100%' }} />
            ) : (
              <>
                <UploadCloud size={32} color="var(--color-text-muted)" style={{ margin: '0 auto 12px' }} />
                <p style={{ fontWeight: 600 }}>Click to upload image</p>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>PNG, JPG, WEBP up to 10MB</p>
              </>
            )}
          </div>
          <input id="img-upload" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
        </div>

        <div style={{ background: 'var(--color-bg-body)', borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <BrainCircuit size={20} color="var(--color-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--color-text-body)' }}>AI Verification:</strong> Your image and description will be analyzed by Gemini AI via OpenRouter to detect fake images, verify authenticity, and check for duplicates before your report goes live.
          </p>
        </div>

        <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '16px' }}>
          {submitting ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Submitting & Verifying...</> : '🚀 Submit Issue Report'}
        </button>
      </form>
    </div>
  );
}
