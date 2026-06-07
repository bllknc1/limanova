import { getTranslations } from 'next-intl/server';
import Navbar from '@/components/Navbar';

export default async function StructurePage() {
  const t = await getTranslations('structure');
  const cards = t.raw('cards') as any[];

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 960, margin: '0 auto', padding: '4rem 2rem' }}>
        <p style={{ fontSize: '.75rem', letterSpacing: '.3em', color: 'var(--teal2)', textTransform: 'uppercase', marginBottom: '.8rem' }}>{t('tag')}</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem,3vw,2.4rem)', color: 'var(--gold)', marginBottom: '1rem' }}>{t('title')}</h1>
        <p style={{ color: 'var(--text2)', lineHeight: 1.9, fontSize: '1.05rem', marginBottom: '2.5rem' }}>{t('intro')}</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem' }}>
          {cards.map((card: any) => (
            <div key={card.title} style={{ background: 'var(--navy2)', border: '1px solid var(--border)', padding: '1.5rem' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '.8rem' }}>{card.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '.95rem', color: 'var(--gold)', marginBottom: '.5rem', letterSpacing: '.05em' }}>{card.title}</div>
              <div style={{ color: 'var(--text2)', fontSize: '.88rem', lineHeight: 1.6, marginBottom: '.8rem' }}>{card.body}</div>
              <div style={{ display: 'inline-block', fontSize: '.65rem', letterSpacing: '.15em', padding: '3px 8px', background: 'rgba(26,138,122,.15)', color: 'var(--teal2)', border: '1px solid rgba(26,138,122,.3)' }}>
                {card.badge}
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
