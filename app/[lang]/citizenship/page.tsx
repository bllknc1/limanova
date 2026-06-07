'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useRef } from 'react';
import Navbar from '@/components/Navbar';

export default function CitizenshipPage() {
  const t = useTranslations('citizenship');
  const locale = useLocale();
  const fields = t.raw('science_fields') as string[];

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', country: '',
    science_field: '', vision: '',
  });
  const [step, setStep] = useState<'form' | 'paying'>('form');
  const [error, setError] = useState('');

  const handleChange = (e: any) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    const { first_name, last_name, email, country, science_field, vision } = form;
    if (!first_name || !last_name || !email || !country || !science_field || !vision) {
      setError(locale === 'tr' ? 'Lütfen tüm alanları doldurun.' : 'Please fill all fields.');
      return;
    }
    setError('');
    setStep('paying');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; return; }
      setError(data.error || 'Payment error');
      setStep('form');
    } catch (err: any) {
      setError(err.message);
      setStep('form');
    }
  };

  const inputStyle = { background: 'var(--navy3)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '1rem', padding: '10px 14px', outline: 'none', width: '100%' };
  const labelStyle = { fontSize: '.75rem', letterSpacing: '.2em', color: 'var(--text3)', textTransform: 'uppercase' as const, display: 'block', marginBottom: '.4rem' };

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '4rem 2rem' }}>
        <p style={{ fontSize: '.75rem', letterSpacing: '.3em', color: 'var(--teal2)', textTransform: 'uppercase', marginBottom: '.8rem' }}>{t('tag')}</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem,3vw,2.4rem)', color: 'var(--gold)', marginBottom: '1.5rem' }}>{t('title')}</h1>
        <p style={{ color: 'var(--text2)', lineHeight: 1.9, fontSize: '1.05rem', marginBottom: '2rem' }}>{t('intro')}</p>

        {step === 'form' && (
          <div style={{ background: 'var(--navy2)', border: '1px solid var(--border)', padding: '2.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--gold)', marginBottom: '.4rem' }}>{t('form_title')}</h2>
            <p style={{ color: 'var(--text3)', fontSize: '.9rem', marginBottom: '2rem', fontStyle: 'italic' }}>{t('form_sub')}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div><label style={labelStyle}>{t('field_first')}</label><input style={inputStyle} name="first_name" value={form.first_name} onChange={handleChange} /></div>
              <div><label style={labelStyle}>{t('field_last')}</label><input style={inputStyle} name="last_name" value={form.last_name} onChange={handleChange} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div><label style={labelStyle}>{t('field_email')}</label><input style={inputStyle} name="email" type="email" value={form.email} onChange={handleChange} /></div>
              <div><label style={labelStyle}>{t('field_country')}</label><input style={inputStyle} name="country" value={form.country} onChange={handleChange} /></div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>{t('field_science')}</label>
              <select style={inputStyle} name="science_field" value={form.science_field} onChange={handleChange}>
                <option value="">--</option>
                {fields.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>{t('field_vision')}</label>
              <textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }} name="vision" value={form.vision} onChange={handleChange} placeholder={t('field_vision_placeholder')} />
            </div>

            {error && <p style={{ color: '#e24b4a', marginBottom: '1rem' }}>{error}</p>}

            <button onClick={handleSubmit} style={{ width: '100%', background: 'var(--gold)', color: 'var(--navy)', fontFamily: 'var(--font-display)', fontSize: '.85rem', letterSpacing: '.12em', padding: '14px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              {t('btn_next')}
            </button>

            <p style={{ background: 'rgba(201,162,39,.05)', border: '1px solid var(--border)', padding: '1rem 1.5rem', marginTop: '1.5rem', fontSize: '.88rem', color: 'var(--text3)', fontStyle: 'italic', textAlign: 'center' }}>
              {t('review_note')}
            </p>
          </div>
        )}

        {step === 'paying' && (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--navy2)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚗</div>
            <p style={{ color: 'var(--text2)' }}>{locale === 'tr' ? 'Ödeme sayfasına yönlendiriliyorsunuz...' : 'Redirecting to payment...'}</p>
          </div>
        )}
      </main>
    </>
  );
}
