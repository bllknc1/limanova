import { getTranslations } from 'next-intl/server';
import Navbar from '@/components/Navbar';

export default async function ConstitutionPage({ params: { lang } }: { params: { lang: string } }) {
  const t = await getTranslations('constitution');
  const articles = t.raw('articles') as any[];

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '4rem 2rem' }}>
        <p style={{ fontSize: '.75rem', letterSpacing: '.3em', color: 'var(--teal2)', textTransform: 'uppercase', marginBottom: '.8rem' }}>{t('tag')}</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem,3vw,2.4rem)', color: 'var(--gold)', marginBottom: '1.5rem' }}>{t('title')}</h1>
        <p style={{ color: 'var(--text2)', lineHeight: 1.9, fontSize: '1.05rem', marginBottom: '3rem' }}>{t('intro')}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {articles.map((a: any) => (
            <div key={a.num} style={{ borderLeft: '2px solid var(--border2)', padding: '1rem 1.5rem', background: 'rgba(201,162,39,.03)' }}>
              <div style={{ fontSize: '.7rem', letterSpacing: '.3em', color: 'var(--teal2)', marginBottom: '.4rem' }}>{a.num}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--gold)', marginBottom: '.5rem' }}>{a.title}</div>
              <div style={{ color: 'var(--text2)', fontSize: '.95rem', lineHeight: 1.7 }}>{a.body}</div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
