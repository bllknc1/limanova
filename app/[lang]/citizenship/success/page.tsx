'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function SuccessPage({ params: { lang } }: { params: { lang: string } }) {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Mark payment confirmed in DB via API
    if (email) {
      fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }).then(() => setDone(true));
    } else {
      setDone(true);
    }
  }, [email]);

  const isTr = lang === 'tr';

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 680, margin: '0 auto', padding: '6rem 2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>⚗</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--gold)', marginBottom: '1rem' }}>
          {isTr ? 'Ödeme Alındı!' : 'Payment Received!'}
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '2rem' }}>
          {isTr
            ? `Başvurunuz ve ödemeniz alındı. Vatandaşlık Komisyonu ${email ?? ''} adresinize 7–14 gün içinde bildirim yapacaktır.`
            : `Your application and payment have been received. The Citizenship Commission will notify ${email ?? ''} within 7–14 days.`}
        </p>
        <div style={{ background: 'rgba(26,138,122,.08)', border: '1px solid rgba(26,138,122,.3)', padding: '1.5rem', marginBottom: '2rem' }}>
          <p style={{ color: 'var(--teal2)', fontFamily: 'var(--font-display)', fontSize: '.85rem', letterSpacing: '.1em' }}>
            {isTr ? 'Başvuru Durumu: BEKLEMEde' : 'Application Status: PENDING'}
          </p>
        </div>
        <Link href={`/${lang}`} style={{
          background: 'transparent', color: 'var(--gold)',
          border: '1px solid var(--border2)',
          fontFamily: 'var(--font-display)', fontSize: '.8rem', letterSpacing: '.12em',
          padding: '12px 28px', textDecoration: 'none',
        }}>
          {isTr ? '← Ana Sayfaya Dön' : '← Back to Home'}
        </Link>
      </main>
    </>
  );
}
