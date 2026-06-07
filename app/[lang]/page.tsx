import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import Navbar from '@/components/Navbar';

export default async function HomePage({ params: { lang } }: { params: { lang: string } }) {
  const t = await getTranslations('hero');
  const navT = await getTranslations('nav');

  // Get real citizen count
  let citizenCount = 0;
  try {
    const { count } = await supabaseAdmin.from('citizens').select('*', { count: 'exact', head: true });
    citizenCount = count ?? 0;
  } catch {}

  const base = `/${lang}`;

  return (
    <>
      <Navbar />
      <main>
        {/* HERO */}
        <section style={{
          minHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '4rem 2rem',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Background glow */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(26,138,122,.06), transparent)',
            pointerEvents: 'none',
          }} />

          {/* Seal */}
          <div style={{ width: 160, height: 160, margin: '0 auto 2rem', position: 'relative' }}>
            <svg viewBox="0 0 160 160" className="animate-seal" style={{ width: '100%', height: '100%' }}>
              <circle cx="80" cy="80" r="78" fill="none" stroke="#c9a227" strokeWidth="1" strokeDasharray="4 5"/>
              <circle cx="80" cy="80" r="60" fill="none" stroke="#c9a22744" strokeWidth="0.5"/>
              <text fontFamily="Cinzel,serif" fontSize="8.5" fill="#c9a227" letterSpacing="4">
                <textPath href="#cp">LIMANOVA • SCIENCE STATE • MMXXV •</textPath>
              </text>
              <defs><path id="cp" d="M80,14 a66,66 0 1,1 -0.1,0"/></defs>
            </svg>
            <div style={{
              position: 'absolute', inset: '20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.5rem',
            }}>⚗</div>
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem,6vw,4.5rem)', color: 'var(--gold)', letterSpacing: '.1em', marginBottom: '.3rem' }}>
            LIMANOVA
          </h1>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '.85rem', letterSpacing: '.4em', color: 'var(--teal2)', marginBottom: '1.5rem', textTransform: 'uppercase' }}>
            {t('subtitle')}
          </p>
          <p style={{ fontSize: '1.3rem', fontStyle: 'italic', color: 'var(--text2)', maxWidth: 520, lineHeight: 1.6, marginBottom: '3rem' }}>
            "{t('motto')}"
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '3rem' }}>
            <Link href={`${base}/citizenship`} style={{
              background: 'var(--gold)', color: 'var(--navy)',
              fontFamily: 'var(--font-display)', fontSize: '.8rem', letterSpacing: '.12em',
              padding: '12px 28px', textDecoration: 'none', fontWeight: 600,
            }}>
              {t('cta_apply')}
            </Link>
            <Link href={`${base}/constitution`} style={{
              background: 'transparent', color: 'var(--gold)',
              border: '1px solid var(--border2)',
              fontFamily: 'var(--font-display)', fontSize: '.8rem', letterSpacing: '.12em',
              padding: '12px 28px', textDecoration: 'none',
            }}>
              {t('cta_constitution')}
            </Link>
          </div>

          <div style={{ width: 60, height: 1, background: 'var(--border2)', margin: '0 auto 2rem' }} />

          <div style={{ display: 'flex', gap: '3rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { n: '1', l: t('stat_founding') },
              { n: citizenCount.toString(), l: t('stat_citizens') },
              { n: '∞', l: t('stat_potential') },
            ].map(s => (
              <div key={s.l} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--gold)' }}>{s.n}</div>
                <div style={{ fontSize: '.8rem', letterSpacing: '.2em', color: 'var(--text3)', textTransform: 'uppercase', marginTop: 4 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
