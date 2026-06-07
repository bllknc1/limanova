'use client';

import { useState, useEffect, useCallback } from 'react';

const ADMIN_SECRET = 'limanova-derin-devlet-2026';

type Application = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  country: string;
  science_field: string;
  vision: string;
  payment_status: string;
  status: string;
  created_at: string;
};

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, paid: 0 });

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/applications', {
        headers: { 'x-admin-secret': ADMIN_SECRET },
      });
      const data = await res.json();
      if (data.applications) {
        setApplications(data.applications);
        const apps = data.applications as Application[];
        setStats({
          total: apps.length,
          pending: apps.filter(a => a.status === 'pending').length,
          approved: apps.filter(a => a.status === 'approved').length,
          rejected: apps.filter(a => a.status === 'rejected').length,
          paid: apps.filter(a => a.payment_status === 'paid').length,
        });
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authenticated) fetchApplications();
  }, [authenticated, fetchApplications]);

  const handleAction = async (applicationId: string, action: 'approve' | 'reject') => {
    setActionLoading(applicationId);
    try {
      const res = await fetch('/api/admin/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': ADMIN_SECRET },
        body: JSON.stringify({ applicationId, action }),
      });
      const data = await res.json();
      if (data.ok) {
        await fetchApplications();
      } else {
        alert('Hata: ' + (data.error || 'Bilinmeyen hata'));
      }
    } catch (e: any) {
      alert('Hata: ' + e.message);
    }
    setActionLoading(null);
  };

  // Login ekranı
  if (!authenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--navy)',
      }}>
        <div style={{
          background: 'var(--navy2)',
          border: '1px solid var(--border)',
          padding: '3rem',
          maxWidth: 420,
          width: '100%',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🜁</div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.4rem',
            color: 'var(--gold)',
            letterSpacing: '.12em',
            marginBottom: '.5rem',
          }}>
            DERİN DEVLET
          </h1>
          <p style={{ color: 'var(--text3)', fontSize: '.85rem', marginBottom: '2rem', letterSpacing: '.1em' }}>
            YÖNETIM PANELİ
          </p>

          <form onSubmit={(e) => {
            e.preventDefault();
            if (password === ADMIN_SECRET) {
              setAuthenticated(true);
            } else {
              alert('Yanlış şifre');
            }
          }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Erişim kodu"
              style={{
                marginBottom: '1rem',
                textAlign: 'center',
                letterSpacing: '.2em',
              }}
            />
            <button type="submit" style={{
              width: '100%',
              background: 'var(--gold)',
              color: 'var(--navy)',
              fontFamily: 'var(--font-display)',
              fontSize: '.8rem',
              letterSpacing: '.12em',
              padding: '12px',
              border: 'none',
              cursor: 'pointer',
              transition: '.2s',
            }}>
              GİRİŞ
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filtered = filter === 'all' ? applications : applications.filter(a => a.status === filter);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', padding: '2rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '1.5rem',
      }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            color: 'var(--gold)',
            letterSpacing: '.1em',
          }}>
            🜁 DERİN DEVLET — YÖNETİM PANELİ
          </h1>
          <p style={{ color: 'var(--text3)', fontSize: '.85rem', marginTop: '.3rem' }}>
            Vatandaşlık Komisyonu Kontrol Merkezi
          </p>
        </div>
        <button onClick={() => setAuthenticated(false)} style={{
          background: 'transparent',
          border: '1px solid var(--border)',
          color: 'var(--text3)',
          fontFamily: 'var(--font-display)',
          fontSize: '.7rem',
          letterSpacing: '.1em',
          padding: '8px 16px',
          cursor: 'pointer',
        }}>
          ÇIKIŞ
        </button>
      </div>

      {/* İstatistikler */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        {[
          { label: 'Toplam', value: stats.total, color: 'var(--text)' },
          { label: 'Bekleyen', value: stats.pending, color: '#f59e0b' },
          { label: 'Onaylı', value: stats.approved, color: '#22c55e' },
          { label: 'Reddedildi', value: stats.rejected, color: '#ef4444' },
          { label: 'Ödeme Yapan', value: stats.paid, color: 'var(--teal2)' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--navy2)',
            border: '1px solid var(--border)',
            padding: '1.2rem',
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.8rem',
              color: s.color,
            }}>{s.value}</div>
            <div style={{
              fontSize: '.75rem',
              color: 'var(--text3)',
              letterSpacing: '.15em',
              textTransform: 'uppercase',
              marginTop: '.3rem',
            }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filtre butonları */}
      <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            background: filter === f ? 'var(--gold)' : 'transparent',
            color: filter === f ? 'var(--navy)' : 'var(--text2)',
            border: '1px solid var(--border2)',
            fontFamily: 'var(--font-display)',
            fontSize: '.7rem',
            letterSpacing: '.1em',
            padding: '6px 16px',
            cursor: 'pointer',
            transition: '.2s',
          }}>
            {f === 'all' ? 'TÜMÜ' : f === 'pending' ? 'BEKLEYEN' : f === 'approved' ? 'ONAYLI' : 'RED'}
          </button>
        ))}
        <button onClick={fetchApplications} style={{
          marginLeft: 'auto',
          background: 'transparent',
          border: '1px solid var(--border)',
          color: 'var(--text3)',
          fontFamily: 'var(--font-display)',
          fontSize: '.7rem',
          letterSpacing: '.1em',
          padding: '6px 16px',
          cursor: 'pointer',
        }}>
          ↻ YENİLE
        </button>
      </div>

      {/* Başvuru tablosu */}
      {loading ? (
        <p style={{ color: 'var(--text3)', textAlign: 'center', padding: '3rem' }}>Yükleniyor...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: 'var(--text3)', textAlign: 'center', padding: '3rem' }}>Başvuru bulunamadı.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '.9rem',
          }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border2)' }}>
                {['Ad Soyad', 'E-posta', 'Ülke', 'Bilim Alanı', 'Ödeme', 'Durum', 'Tarih', 'İşlem'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left',
                    padding: '.8rem .6rem',
                    fontFamily: 'var(--font-display)',
                    fontSize: '.65rem',
                    letterSpacing: '.15em',
                    color: 'var(--text3)',
                    textTransform: 'uppercase',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(app => (
                <tr key={app.id} style={{
                  borderBottom: '1px solid var(--border)',
                  transition: '.2s',
                }}>
                  <td style={{ padding: '.8rem .6rem', color: 'var(--text)', fontWeight: 600 }}>
                    {app.first_name} {app.last_name}
                  </td>
                  <td style={{ padding: '.8rem .6rem', color: 'var(--text2)', fontSize: '.85rem' }}>
                    {app.email}
                  </td>
                  <td style={{ padding: '.8rem .6rem', color: 'var(--text2)' }}>
                    {app.country}
                  </td>
                  <td style={{ padding: '.8rem .6rem', color: 'var(--teal2)', fontSize: '.85rem' }}>
                    {app.science_field}
                  </td>
                  <td style={{ padding: '.8rem .6rem' }}>
                    <span style={{
                      background: app.payment_status === 'paid' ? 'rgba(34,197,94,.15)' : 'rgba(245,158,11,.15)',
                      color: app.payment_status === 'paid' ? '#22c55e' : '#f59e0b',
                      fontSize: '.7rem',
                      fontFamily: 'var(--font-display)',
                      letterSpacing: '.1em',
                      padding: '3px 10px',
                    }}>
                      {app.payment_status === 'paid' ? 'ÖDENDİ' : 'BEKLEMEDE'}
                    </span>
                  </td>
                  <td style={{ padding: '.8rem .6rem' }}>
                    <span style={{
                      background: app.status === 'approved' ? 'rgba(34,197,94,.15)' :
                                  app.status === 'rejected' ? 'rgba(239,68,68,.15)' : 'rgba(245,158,11,.15)',
                      color: app.status === 'approved' ? '#22c55e' :
                             app.status === 'rejected' ? '#ef4444' : '#f59e0b',
                      fontSize: '.7rem',
                      fontFamily: 'var(--font-display)',
                      letterSpacing: '.1em',
                      padding: '3px 10px',
                    }}>
                      {app.status === 'approved' ? 'ONAYLI' : app.status === 'rejected' ? 'RED' : 'BEKLEMEDE'}
                    </span>
                  </td>
                  <td style={{ padding: '.8rem .6rem', color: 'var(--text3)', fontSize: '.8rem' }}>
                    {new Date(app.created_at).toLocaleDateString('tr-TR')}
                  </td>
                  <td style={{ padding: '.8rem .6rem' }}>
                    {app.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: '.4rem' }}>
                        <button
                          onClick={() => handleAction(app.id, 'approve')}
                          disabled={actionLoading === app.id}
                          style={{
                            background: '#22c55e',
                            color: '#fff',
                            border: 'none',
                            fontFamily: 'var(--font-display)',
                            fontSize: '.6rem',
                            letterSpacing: '.1em',
                            padding: '5px 12px',
                            cursor: 'pointer',
                            opacity: actionLoading === app.id ? 0.5 : 1,
                          }}
                        >
                          ✓ ONAYLA
                        </button>
                        <button
                          onClick={() => handleAction(app.id, 'reject')}
                          disabled={actionLoading === app.id}
                          style={{
                            background: '#ef4444',
                            color: '#fff',
                            border: 'none',
                            fontFamily: 'var(--font-display)',
                            fontSize: '.6rem',
                            letterSpacing: '.1em',
                            padding: '5px 12px',
                            cursor: 'pointer',
                            opacity: actionLoading === app.id ? 0.5 : 1,
                          }}
                        >
                          ✕ RED
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text3)', fontSize: '.75rem' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Vizyon detay paneli */}
      {filtered.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '.85rem',
            color: 'var(--gold)',
            letterSpacing: '.1em',
            marginBottom: '1rem',
          }}>
            BAŞVURU VİZYONLARI
          </h3>
          {filtered.map(app => (
            <div key={app.id} style={{
              background: 'var(--navy2)',
              border: '1px solid var(--border)',
              padding: '1.2rem',
              marginBottom: '.8rem',
            }}>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '.8rem',
                color: 'var(--gold)',
                letterSpacing: '.08em',
                marginBottom: '.5rem',
              }}>
                {app.first_name} {app.last_name} — {app.science_field}
              </div>
              <p style={{
                color: 'var(--text2)',
                fontSize: '.9rem',
                lineHeight: 1.6,
                fontStyle: 'italic',
              }}>
                &ldquo;{app.vision}&rdquo;
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
