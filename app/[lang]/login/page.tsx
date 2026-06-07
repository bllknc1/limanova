'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function LoginPage() {
  const t = useTranslations('login');
  const locale = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, accessCode }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        if (res.status === 403) {
          setError(t('suspended'));
        } else {
          setError(t('invalid'));
        }
        setLoading(false);
        return;
      }

      // Store token & citizen info
      localStorage.setItem('lmn_token', data.token);
      localStorage.setItem('lmn_citizen', JSON.stringify(data.citizen));

      // Dispatch event so Navbar updates
      window.dispatchEvent(new Event('lmn_auth_change'));

      // Redirect to profile
      router.push(`/${locale}/profile`);
    } catch {
      setError(t('error'));
    }
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <main style={{
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}>
        <div style={{
          background: 'var(--navy2)',
          border: '1px solid var(--border)',
          padding: '3rem',
          maxWidth: 460,
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative corner elements */}
          <div style={{
            position: 'absolute', top: 0, left: 0, width: 30, height: 30,
            borderTop: '2px solid var(--gold)', borderLeft: '2px solid var(--gold)',
          }} />
          <div style={{
            position: 'absolute', top: 0, right: 0, width: 30, height: 30,
            borderTop: '2px solid var(--gold)', borderRight: '2px solid var(--gold)',
          }} />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, width: 30, height: 30,
            borderBottom: '2px solid var(--gold)', borderLeft: '2px solid var(--gold)',
          }} />
          <div style={{
            position: 'absolute', bottom: 0, right: 0, width: 30, height: 30,
            borderBottom: '2px solid var(--gold)', borderRight: '2px solid var(--gold)',
          }} />

          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            {/* Seal icon */}
            <div style={{
              width: 70, height: 70, margin: '0 auto 1rem',
              border: '1px solid var(--border2)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem',
              background: 'radial-gradient(circle, rgba(201,162,39,0.08), transparent)',
            }}>
              ⚗
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.6rem',
              color: 'var(--gold)',
              letterSpacing: '.12em',
              marginBottom: '.3rem',
            }}>
              {t('title')}
            </h1>
            <p style={{
              color: 'var(--text3)',
              fontSize: '.8rem',
              letterSpacing: '.2em',
              textTransform: 'uppercase',
            }}>
              {t('subtitle')}
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{
                display: 'block',
                fontFamily: 'var(--font-display)',
                fontSize: '.7rem',
                letterSpacing: '.15em',
                color: 'var(--text3)',
                marginBottom: '.4rem',
                textTransform: 'uppercase',
              }}>
                {t('email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('email_placeholder')}
                required
                style={{
                  fontSize: '.95rem',
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontFamily: 'var(--font-display)',
                fontSize: '.7rem',
                letterSpacing: '.15em',
                color: 'var(--text3)',
                marginBottom: '.4rem',
                textTransform: 'uppercase',
              }}>
                {t('access_code')}
              </label>
              <input
                type="password"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder={t('code_placeholder')}
                required
                style={{
                  fontSize: '.95rem',
                  letterSpacing: '.15em',
                  textAlign: 'center',
                }}
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#ef4444',
                padding: '.8rem',
                fontSize: '.85rem',
                marginBottom: '1rem',
                textAlign: 'center',
              }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%',
              background: loading ? 'var(--gold-dim)' : 'var(--gold)',
              color: 'var(--navy)',
              fontFamily: 'var(--font-display)',
              fontSize: '.8rem',
              letterSpacing: '.12em',
              padding: '14px',
              border: 'none',
              cursor: loading ? 'wait' : 'pointer',
              transition: '.2s',
              fontWeight: 600,
            }}>
              {loading ? '...' : t('btn')}
            </button>
          </form>

          <div style={{
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border)',
            textAlign: 'center',
          }}>
            <p style={{ color: 'var(--text3)', fontSize: '.82rem', marginBottom: '.8rem' }}>
              {t('no_account')}
            </p>
            <Link href={`/${locale}/citizenship`} style={{
              color: 'var(--teal2)',
              fontFamily: 'var(--font-display)',
              fontSize: '.75rem',
              letterSpacing: '.1em',
              textDecoration: 'none',
              borderBottom: '1px solid var(--teal)',
              paddingBottom: '2px',
            }}>
              {t('apply_link')} →
            </Link>
          </div>

          <p style={{
            color: 'var(--text3)',
            fontSize: '.72rem',
            textAlign: 'center',
            marginTop: '1.5rem',
            lineHeight: 1.5,
            fontStyle: 'italic',
          }}>
            {t('note')}
          </p>
        </div>
      </main>
    </>
  );
}
