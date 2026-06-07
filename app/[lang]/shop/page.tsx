'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function ShopPage() {
  const t = useTranslations('shop');
  const locale = useLocale();
  const router = useRouter();
  const items = t.raw('items') as any[];
  const [orderItem, setOrderItem] = useState<any>(null);
  const [address, setAddress] = useState('');
  const [ordering, setOrdering] = useState(false);
  const [ordered, setOrdered] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [citizenName, setCitizenName] = useState('');

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('lmn_token');
      const citizen = localStorage.getItem('lmn_citizen');
      setIsLoggedIn(!!token);
      if (citizen) {
        try { const c = JSON.parse(citizen); setCitizenName(`${c.first_name} ${c.last_name}`); } catch {}
      }
    };
    checkAuth();
    window.addEventListener('lmn_auth_change', checkAuth);
    return () => window.removeEventListener('lmn_auth_change', checkAuth);
  }, []);

  const handleOrder = (item: any) => {
    if (!isLoggedIn) {
      router.push(`/${locale}/login`);
      return;
    }
    setOrderItem(item);
  };

  const confirmOrder = async () => {
    if (!address.trim() || ordering) return;
    setOrdering(true);
    try {
      const token = localStorage.getItem('lmn_token');
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          itemId: orderItem.id,
          itemName: orderItem.name,
          price: orderItem.price,
          address,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setOrdered(o => [...o, orderItem.id]);
        setOrderItem(null);
        setAddress('');
      }
    } catch {
      alert(locale === 'tr' ? 'Bir hata oluştu.' : 'An error occurred.');
    }
    setOrdering(false);
  };

  const categories = Array.from(new Set(items.map((i: any) => i.category)));

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 960, margin: '0 auto', padding: '4rem 2rem' }}>
        <p style={{ fontSize: '.75rem', letterSpacing: '.3em', color: 'var(--teal2)', textTransform: 'uppercase', marginBottom: '.8rem' }}>{t('tag')}</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem,3vw,2.4rem)', color: 'var(--gold)', marginBottom: '1rem' }}>{t('title')}</h1>
        <p style={{ color: 'var(--text2)', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '2.5rem' }}>{t('intro')}</p>

        {!isLoggedIn && (
          <div
            onClick={() => router.push(`/${locale}/login`)}
            style={{ background: 'rgba(201,162,39,.06)', border: '1px solid var(--border2)', padding: '1rem 1.5rem', marginBottom: '2rem', fontSize: '.9rem', color: 'var(--gold)', textAlign: 'center', cursor: 'pointer', transition: '.2s' }}
          >
            🔒 {t('login_required')} — {locale === 'tr' ? 'Vatandaş girişi yapın.' : 'Please log in as a citizen.'} →
          </div>
        )}

        {isLoggedIn && (
          <div style={{ background: 'rgba(34,197,94,.06)', border: '1px solid rgba(34,197,94,.2)', padding: '1rem 1.5rem', marginBottom: '2rem', fontSize: '.9rem', color: '#22c55e', textAlign: 'center' }}>
            ✓ {locale === 'tr' ? `Hoş geldin, ${citizenName}. Sipariş verebilirsin.` : `Welcome, ${citizenName}. You can place orders.`}
          </div>
        )}

        {categories.map(cat => (
          <div key={cat} style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--teal2)', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: '1.2rem', borderBottom: '1px solid var(--border)', paddingBottom: '.8rem' }}>
              {cat}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.2rem' }}>
              {items.filter((i: any) => i.category === cat).map((item: any) => (
                <div key={item.id} style={{
                  background: 'var(--navy2)', border: '1px solid var(--border)',
                  padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '.8rem',
                }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--gold)' }}>{item.name}</div>
                  <div style={{ color: 'var(--text2)', fontSize: '.88rem', lineHeight: 1.6, flex: 1 }}>{item.description}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--gold)' }}>${item.price}</span>
                    <button
                      onClick={() => handleOrder(item)}
                      disabled={ordered.includes(item.id)}
                      style={{
                        background: ordered.includes(item.id) ? 'rgba(26,138,122,.15)' : 'transparent',
                        border: `1px solid ${ordered.includes(item.id) ? 'var(--teal)' : 'var(--border2)'}`,
                        color: ordered.includes(item.id) ? 'var(--teal2)' : 'var(--gold)',
                        fontFamily: 'var(--font-display)', fontSize: '.7rem', letterSpacing: '.1em',
                        padding: '7px 14px', cursor: ordered.includes(item.id) ? 'default' : 'pointer',
                      }}
                    >
                      {ordered.includes(item.id) ? (locale === 'tr' ? '✓ Sipariş Verildi' : '✓ Ordered') : t('add_to_cart')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Order modal */}
        {orderItem && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
            <div style={{ background: 'var(--navy2)', border: '1px solid var(--border2)', padding: '2rem', maxWidth: 480, width: '90%' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', marginBottom: '.5rem' }}>{orderItem.name}</h3>
              <p style={{ color: 'var(--teal2)', fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '1.5rem' }}>${orderItem.price}</p>
              <p style={{ color: 'var(--text2)', fontSize: '.9rem', marginBottom: '.5rem' }}>
                {locale === 'tr' ? 'Kargo adresi girin:' : 'Enter your shipping address:'}
              </p>
              <textarea
                value={address} onChange={e => setAddress(e.target.value)}
                style={{ width: '100%', background: 'var(--navy3)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '1rem', padding: '10px', minHeight: 80, resize: 'vertical' }}
                placeholder={locale === 'tr' ? 'Tam adres, şehir, ülke...' : 'Full address, city, country...'}
              />
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button onClick={confirmOrder} disabled={ordering} style={{
                  flex: 1, background: ordering ? 'var(--gold-dim)' : 'var(--gold)', color: 'var(--navy)',
                  fontFamily: 'var(--font-display)', fontSize: '.8rem', letterSpacing: '.1em',
                  padding: '12px', border: 'none', cursor: ordering ? 'wait' : 'pointer', fontWeight: 600,
                }}>
                  {ordering ? '...' : locale === 'tr' ? `Onayla ($${orderItem.price})` : `Confirm ($${orderItem.price})`}
                </button>
                <button onClick={() => setOrderItem(null)} style={{
                  flex: 1, background: 'transparent', color: 'var(--text2)',
                  border: '1px solid var(--border)', fontFamily: 'var(--font-display)', fontSize: '.8rem',
                  padding: '12px', cursor: 'pointer',
                }}>
                  {locale === 'tr' ? 'İptal' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
