'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [citizenName, setCitizenName] = useState('');

  // Check auth state
  useEffect(() => {
    const checkAuth = () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('lmn_token') : null;
      const citizen = typeof window !== 'undefined' ? localStorage.getItem('lmn_citizen') : null;
      setLoggedIn(!!token);
      if (citizen) {
        try {
          const c = JSON.parse(citizen);
          setCitizenName(c.first_name);
        } catch {}
      } else {
        setCitizenName('');
      }
    };

    checkAuth();
    window.addEventListener('lmn_auth_change', checkAuth);
    window.addEventListener('storage', checkAuth);
    return () => {
      window.removeEventListener('lmn_auth_change', checkAuth);
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  const base = `/${locale}`;

  const links = [
    { href: base, label: t('home') },
    { href: `${base}/constitution`, label: t('constitution') },
    { href: `${base}/structure`, label: t('structure') },
    { href: `${base}/citizenship`, label: t('citizenship') },
    { href: `${base}/shop`, label: t('shop') },
  ];

  return (
    <nav style={{
      background: 'rgba(10,14,26,0.97)',
      borderBottom: '1px solid var(--border)',
      padding: '0 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      height: '60px',
      backdropFilter: 'blur(8px)',
    }}>
      <Link href={base} style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--gold)', letterSpacing: '.15em', textDecoration: 'none' }}>
        ⚗ LIMANOVA
      </Link>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        {links.map(l => (
          <Link key={l.href} href={l.href} style={{
            color: pathname === l.href ? 'var(--gold)' : 'var(--text2)',
            textDecoration: 'none',
            fontFamily: 'var(--font-body)',
            fontSize: '1rem',
            transition: '.2s',
          }}>
            {l.label}
          </Link>
        ))}

        {/* Language Toggle */}
        <div style={{ display: 'flex', gap: '4px', marginLeft: '.5rem' }}>
          {['en', 'tr'].map(l => (
            <button key={l} onClick={() => switchLocale(l)} style={{
              background: locale === l ? 'var(--gold)' : 'transparent',
              border: '1px solid var(--border2)',
              color: locale === l ? 'var(--navy)' : 'var(--text3)',
              fontFamily: 'var(--font-display)',
              fontSize: '.65rem',
              letterSpacing: '.1em',
              padding: '3px 8px',
              cursor: 'pointer',
              transition: '.2s',
            }}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Auth buttons */}
        {loggedIn ? (
          <Link href={`${base}/profile`} style={{
            background: 'transparent',
            border: '1px solid var(--gold)',
            color: 'var(--gold)',
            fontFamily: 'var(--font-display)',
            fontSize: '.75rem',
            letterSpacing: '.1em',
            padding: '6px 14px',
            textDecoration: 'none',
            transition: '.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <span style={{
              width: 20, height: 20,
              borderRadius: '50%',
              background: 'var(--gold)',
              color: 'var(--navy)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '.6rem',
              fontWeight: 700,
            }}>
              {citizenName ? citizenName[0].toUpperCase() : '?'}
            </span>
            {t('profile')}
          </Link>
        ) : (
          <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
            <Link href={`${base}/login`} style={{
              color: 'var(--text2)',
              fontFamily: 'var(--font-display)',
              fontSize: '.75rem',
              letterSpacing: '.1em',
              textDecoration: 'none',
              transition: '.2s',
              padding: '6px 10px',
            }}>
              {t('login')}
            </Link>
            <Link href={`${base}/citizenship`} style={{
              background: 'transparent',
              border: '1px solid var(--gold)',
              color: 'var(--gold)',
              fontFamily: 'var(--font-display)',
              fontSize: '.75rem',
              letterSpacing: '.1em',
              padding: '6px 14px',
              textDecoration: 'none',
              transition: '.2s',
            }}>
              {t('apply')} →
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
