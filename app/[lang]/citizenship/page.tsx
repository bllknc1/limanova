'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type FormData = {
  first_name: string;
  last_name: string;
  email: string;
  country: string;
  science_field: string;
  vision: string;
  document: File | null;
};

export default function CitizenshipPage() {
  const t = useTranslations('citizenship');
  const locale = useLocale();
  const fields = t.raw('science_fields') as string[];

  const [form, setForm] = useState<FormData>({
    first_name: '', last_name: '', email: '', country: '',
    science_field: '', vision: '', document: null,
  });
  const [step, setStep] = useState<'form' | 'paying' | 'done'>('form');
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setForm(f => ({ ...f, document: e.target.files![0] }));
  };

  const handleSubmit = async () => {
    const { first_name, last_name, email, country, science_field, vision } = form;
    if (!first_name || !last_name || !email || !country || !science_field || !vision) {
      setError(locale === 'tr' ? 'Lütfen tüm zorunlu alanları doldurun.' : 'Please fill all required fields.');
      return;
    }
    setError('');
    setStep('paying');

    // Upload document if provided
    let document_url = null;
    if (form.document) {
      const ext = form.document.name.split('.').pop();
      const path = `applications/${Date.now()}-${email}.${ext}`;
      const { data, error: uploadError } = await supabase.storage.from('documents').upload(path, form.document);
      if (!uploadError) document_url = data?.path;
    }

    // Save draft application
    const { error: dbError } = await supabase.from('applications').insert({
      first_name, last_name, email, country, science_field, vision, document_url,
      payment_status: 'unpaid', status: 'pending',
    });

    if (dbError && !dbError.message.includes('unique')) {
      setError(dbError.message);
      setStep('form');
      return;
    }

    // Create Stripe checkout session
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name: `${first_name} ${last_name}` }),
    });
    const { sessionId, error: stripeError } = await res.json();
    if (stripeError) { setError(stripeError); setStep('form'); return; }

    const stripe = await stripePromise;
    await stripe?.redirectToCheckout({ sessionId });
  };

  const inputStyle = {
    background: 'var(--navy3)', border: '1px solid var(--border)',
    color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '1rem',
    padding: '10px 14px', outline: 'none', width: '100%',
  };
  const labelStyle = { fontSize: '.75rem', letterSpacing: '.2em', color: 'var(--text3)', textTransform: 'uppercase' as const, display: 'block', marginBottom: '.4rem' };

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '4rem 2rem' }}>
        <p style={{ fontSize: '.75rem', letterSpacing: '.3em', color: 'var(--teal2)', textTransform: 'uppercase', marginBottom: '.8rem' }}>{t('tag')}</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem,3vw,2.4rem)', color: 'var(--gold)', marginBottom: '1.5rem' }}>{t('title')}</h1>
        <p style={{ color: 'var(--text2)', lineHeight: 1.9, fontSize: '1.05rem', marginBottom: '2rem' }}>{t('intro')}</p>

        {/* Steps */}
        <div style={{ marginBottom: '2.5rem' }}>
          {[1,2,3,4,5].map(n => (
            <div key={n} style={{ display: 'flex', gap: '1.5rem', padding: '1.2rem 0', borderBottom: n < 5 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--border2)', minWidth: 50, lineHeight: 1 }}>0{n}</div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--gold)', marginBottom: '.4rem' }}>{t(`step${n}_title`)}</div>
                <div style={{ color: 'var(--text2)', fontSize: '.9rem', lineHeight: 1.6 }}>{t(`step${n}_body`)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        {step === 'form' && (
          <div style={{ background: 'var(--navy2)', border: '1px solid var(--border)', padding: '2.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--gold)', marginBottom: '.4rem' }}>{t('form_title')}</h2>
            <p style={{ color: 'var(--text3)', fontSize: '.9rem', marginBottom: '2rem', fontStyle: 'italic' }}>{t('form_sub')}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>{t('field_first')}</label>
                <input style={inputStyle} name="first_name" value={form.first_name} onChange={handleChange} />
              </div>
              <div>
                <label style={labelStyle}>{t('field_last')}</label>
                <input style={inputStyle} name="last_name" value={form.last_name} onChange={handleChange} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>{t('field_email')}</label>
                <input style={inputStyle} name="email" type="email" value={form.email} onChange={handleChange} />
              </div>
              <div>
                <label style={labelStyle}>{t('field_country')}</label>
                <input style={inputStyle} name="country" value={form.country} onChange={handleChange} />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>{t('field_science')}</label>
              <select style={inputStyle} name="science_field" value={form.science_field} onChange={handleChange}>
                <option value="">--</option>
                {fields.map((f: string) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>{t('field_vision')}</label>
              <textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }} name="vision" value={form.vision} onChange={handleChange} placeholder={t('field_vision_placeholder')} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>{t('field_doc')}</label>
              <div onClick={() => fileRef.current?.click()} style={{
                border: '1px dashed var(--border2)', padding: '1.5rem', textAlign: 'center',
                cursor: 'pointer', color: form.document ? 'var(--teal2)' : 'var(--text3)',
                fontSize: '.9rem', background: 'rgba(201,162,39,.02)',
              }}>
                {form.document ? `✓ ${form.document.name}` : `📎 ${t('field_doc_sub')}`}
                <input ref={fileRef} type="file" style={{ display: 'none' }} accept=".pdf,.jpg,.jpeg,.png" onChange={handleFile} />
              </div>
            </div>

            {error && <p style={{ color: '#e24b4a', marginBottom: '1rem', fontSize: '.9rem' }}>{error}</p>}

            <button onClick={handleSubmit} style={{
              width: '100%', background: 'var(--gold)', color: 'var(--navy)',
              fontFamily: 'var(--font-display)', fontSize: '.85rem', letterSpacing: '.12em',
              padding: '14px', border: 'none', cursor: 'pointer', fontWeight: 600,
            }}>
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
