'use client';

import { useState, useEffect, useCallback } from 'react';

const ADMIN_SECRET = 'limanova-derin-devlet-2026';

type Application = { id: string; first_name: string; last_name: string; email: string; country: string; science_field: string; vision: string; payment_status: string; status: string; created_at: string; };
type Citizen = { id: string; citizenship_number: string; first_name: string; last_name: string; email: string; country: string; science_field: string; access_code: string | null; created_at: string; };

const hdr = { 'x-admin-secret': ADMIN_SECRET };
const jsonHdr = { ...hdr, 'Content-Type': 'application/json' };

export default function AdminPage() {
  const [auth, setAuth] = useState(false);
  const [pw, setPw] = useState('');
  const [apps, setApps] = useState<Application[]>([]);
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<string|null>(null);
  const [tab, setTab] = useState<'applications'|'citizens'>('applications');
  const [filter, setFilter] = useState<'all'|'pending'|'approved'|'rejected'>('all');
  const [modal, setModal] = useState<{name:string;email:string;code:string;no:string}|null>(null);
  const [editCode, setEditCode] = useState<{id:string;code:string}|null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/applications', { headers: hdr });
      const d = await res.json();
      if (d.applications) setApps(d.applications);
      if (d.citizens) setCitizens(d.citizens);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { if (auth) fetchData(); }, [auth, fetchData]);

  const handleAction = async (applicationId: string, action: 'approve'|'reject') => {
    setBusy(applicationId);
    try {
      const res = await fetch('/api/admin/applications', { method: 'POST', headers: jsonHdr, body: JSON.stringify({ applicationId, action }) });
      const d = await res.json();
      if (d.ok) {
        await fetchData();
        if (action === 'approve' && d.accessCode) setModal({ name: `${d.citizen.first_name} ${d.citizen.last_name}`, email: d.citizen.email, code: d.accessCode, no: d.citizen.citizenship_number || 'TBD' });
      } else alert('Hata: ' + (d.error || '?'));
    } catch (e: any) { alert(e.message); }
    setBusy(null);
  };

  const regenerateCode = async (citizenId: string) => {
    setBusy(citizenId);
    try {
      const res = await fetch('/api/admin/applications', { method: 'POST', headers: jsonHdr, body: JSON.stringify({ citizenId, newAction: 'regenerate_code' }) });
      const d = await res.json();
      if (d.ok) { await fetchData(); alert('Yeni kod: ' + d.accessCode); }
    } catch {}
    setBusy(null);
  };

  const saveCode = async () => {
    if (!editCode) return;
    setBusy(editCode.id);
    try {
      await fetch('/api/admin/applications', { method: 'POST', headers: jsonHdr, body: JSON.stringify({ citizenId: editCode.id, newAction: 'set_code', code: editCode.code }) });
      await fetchData();
      setEditCode(null);
    } catch {}
    setBusy(null);
  };

  const deleteCitizen = async (citizenId: string, name: string) => {
    if (!confirm(`${name} silinsin mi?`)) return;
    setBusy(citizenId);
    try { await fetch('/api/admin/applications', { method: 'POST', headers: jsonHdr, body: JSON.stringify({ citizenId, newAction: 'delete_citizen' }) }); await fetchData(); } catch {}
    setBusy(null);
  };

  // Styles
  const btnS = (bg: string, c: string) => ({ background: bg, color: c, border: 'none', fontFamily: 'var(--font-display)', fontSize: '.6rem', letterSpacing: '.1em', padding: '5px 12px', cursor: 'pointer' } as const);
  const cardS = { background: 'var(--navy2)', border: '1px solid var(--border)', padding: '1.2rem', textAlign: 'center' as const };
  const thS = { textAlign: 'left' as const, padding: '.8rem .6rem', fontFamily: 'var(--font-display)', fontSize: '.65rem', letterSpacing: '.15em', color: 'var(--text3)', textTransform: 'uppercase' as const };
  const tdS = { padding: '.8rem .6rem' };
  const badge = (bg: string, c: string) => ({ background: bg, color: c, fontSize: '.7rem', fontFamily: 'var(--font-display)', letterSpacing: '.1em', padding: '3px 10px' });

  if (!auth) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--navy)' }}>
      <div style={{ background: 'var(--navy2)', border: '1px solid var(--border)', padding: '3rem', maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🜁</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--gold)', letterSpacing: '.12em', marginBottom: '.5rem' }}>DERİN DEVLET</h1>
        <p style={{ color: 'var(--text3)', fontSize: '.85rem', marginBottom: '2rem', letterSpacing: '.1em' }}>YÖNETİM PANELİ</p>
        <form onSubmit={e => { e.preventDefault(); pw === ADMIN_SECRET ? setAuth(true) : alert('Yanlış şifre'); }}>
          <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Erişim kodu" style={{ marginBottom: '1rem', textAlign: 'center', letterSpacing: '.2em' }} />
          <button type="submit" style={{ width: '100%', background: 'var(--gold)', color: 'var(--navy)', fontFamily: 'var(--font-display)', fontSize: '.8rem', letterSpacing: '.12em', padding: '12px', border: 'none', cursor: 'pointer' }}>GİRİŞ</button>
        </form>
      </div>
    </div>
  );

  const stats = { total: apps.length, pending: apps.filter(a=>a.status==='pending').length, approved: apps.filter(a=>a.status==='approved').length, rejected: apps.filter(a=>a.status==='rejected').length, paid: apps.filter(a=>a.payment_status==='paid').length };
  const filtered = filter === 'all' ? apps : apps.filter(a => a.status === filter);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', padding: '2rem' }}>
      {/* Access Code Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setModal(null)}>
          <div style={{ background: 'var(--navy2)', border: '2px solid var(--gold)', padding: '3rem', maxWidth: 500, width: '90%', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '2rem', marginBottom: '.8rem' }}>✓</div>
            <h2 style={{ fontFamily: 'var(--font-display)', color: '#22c55e', fontSize: '1.1rem', letterSpacing: '.12em', marginBottom: '.5rem' }}>VATANDAŞLIK ONAYLANDI</h2>
            <p style={{ color: 'var(--text2)', marginBottom: '1.5rem' }}>{modal.name}</p>
            <div style={{ background: 'var(--navy)', border: '1px solid var(--border2)', padding: '1.5rem', marginBottom: '1rem' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '.65rem', letterSpacing: '.2em', color: 'var(--text3)', marginBottom: '.5rem' }}>ERİŞİM KODU</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--gold)', letterSpacing: '.15em', marginBottom: '.8rem' }}>{modal.code}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '.65rem', letterSpacing: '.2em', color: 'var(--text3)', marginBottom: '.3rem' }}>VATANDAŞLIK NO</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--teal2)', letterSpacing: '.1em' }}>{modal.no}</div>
            </div>
            <p style={{ color: 'var(--text3)', fontSize: '.8rem', marginBottom: '1rem' }}>E-posta: <span style={{ color: 'var(--teal2)' }}>{modal.email}</span></p>
            <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'center' }}>
              <button onClick={() => navigator.clipboard.writeText(`Limanova Vatandaşlık Onayı\n\nHoş geldin, ${modal.name}!\n\nVatandaşlık No: ${modal.no}\nErişim Kodu: ${modal.code}\n\nGiriş: https://limanova.vercel.app/tr/login`)} style={btnS('var(--gold)','var(--navy)')}>📋 KOPYALA</button>
              <button onClick={() => setModal(null)} style={btnS('transparent','var(--text3)')}>KAPAT</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--gold)', letterSpacing: '.1em' }}>🜁 DERİN DEVLET — YÖNETİM PANELİ</h1>
          <p style={{ color: 'var(--text3)', fontSize: '.85rem', marginTop: '.3rem' }}>Vatandaşlık Komisyonu Kontrol Merkezi</p>
        </div>
        <button onClick={() => setAuth(false)} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text3)', fontFamily: 'var(--font-display)', fontSize: '.7rem', letterSpacing: '.1em', padding: '8px 16px', cursor: 'pointer' }}>ÇIKIŞ</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[{ l:'Başvuru',v:stats.total,c:'var(--text)' },{ l:'Bekleyen',v:stats.pending,c:'#f59e0b' },{ l:'Onaylı',v:stats.approved,c:'#22c55e' },{ l:'Red',v:stats.rejected,c:'#ef4444' },{ l:'Vatandaş',v:citizens.length,c:'var(--teal2)' }].map(s=>(
          <div key={s.l} style={cardS}><div style={{ fontFamily:'var(--font-display)',fontSize:'1.8rem',color:s.c }}>{s.v}</div><div style={{ fontSize:'.75rem',color:'var(--text3)',letterSpacing:'.15em',textTransform:'uppercase',marginTop:'.3rem' }}>{s.l}</div></div>
        ))}
      </div>

      {/* Tab Switch */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '1.5rem' }}>
        {(['applications','citizens'] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{ background: tab===t?'var(--gold)':'var(--navy2)', color: tab===t?'var(--navy)':'var(--text2)', border:'1px solid var(--border2)', fontFamily:'var(--font-display)', fontSize:'.75rem', letterSpacing:'.1em', padding:'10px 24px', cursor:'pointer' }}>
            {t==='applications'?'📋 BAŞVURULAR':'👥 VATANDAŞLAR'}
          </button>
        ))}
        <button onClick={fetchData} style={{ marginLeft:'auto', background:'transparent', border:'1px solid var(--border)', color:'var(--text3)', fontFamily:'var(--font-display)', fontSize:'.7rem', letterSpacing:'.1em', padding:'6px 16px', cursor:'pointer' }}>↻ YENİLE</button>
      </div>

      {loading ? <p style={{ color:'var(--text3)',textAlign:'center',padding:'3rem' }}>Yükleniyor...</p> : tab === 'applications' ? (
        <>
          {/* Filter */}
          <div style={{ display:'flex',gap:'.5rem',marginBottom:'1rem',flexWrap:'wrap' }}>
            {(['all','pending','approved','rejected'] as const).map(f=>(
              <button key={f} onClick={()=>setFilter(f)} style={{ background:filter===f?'var(--gold)':'transparent', color:filter===f?'var(--navy)':'var(--text2)', border:'1px solid var(--border2)', fontFamily:'var(--font-display)', fontSize:'.65rem', letterSpacing:'.1em', padding:'5px 14px', cursor:'pointer' }}>
                {f==='all'?'TÜMÜ':f==='pending'?'BEKLEYEN':f==='approved'?'ONAYLI':'RED'}
              </button>
            ))}
          </div>
          {filtered.length===0 ? <p style={{ color:'var(--text3)',textAlign:'center',padding:'3rem' }}>Başvuru yok.</p> : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%',borderCollapse:'collapse',fontSize:'.9rem' }}>
                <thead><tr style={{ borderBottom:'1px solid var(--border2)' }}>
                  {['Ad Soyad','E-posta','Ülke','Alan','Ödeme','Durum','Tarih','İşlem'].map(h=><th key={h} style={thS}>{h}</th>)}
                </tr></thead>
                <tbody>{filtered.map(a=>(
                  <tr key={a.id} style={{ borderBottom:'1px solid var(--border)' }}>
                    <td style={{ ...tdS, color:'var(--text)', fontWeight:600 }}>{a.first_name} {a.last_name}</td>
                    <td style={{ ...tdS, color:'var(--text2)', fontSize:'.85rem' }}>{a.email}</td>
                    <td style={{ ...tdS, color:'var(--text2)' }}>{a.country}</td>
                    <td style={{ ...tdS, color:'var(--teal2)', fontSize:'.85rem' }}>{a.science_field}</td>
                    <td style={tdS}><span style={badge(a.payment_status==='paid'?'rgba(34,197,94,.15)':'rgba(245,158,11,.15)', a.payment_status==='paid'?'#22c55e':'#f59e0b')}>{a.payment_status==='paid'?'ÖDENDİ':'BEKLİYOR'}</span></td>
                    <td style={tdS}><span style={badge(a.status==='approved'?'rgba(34,197,94,.15)':a.status==='rejected'?'rgba(239,68,68,.15)':'rgba(245,158,11,.15)', a.status==='approved'?'#22c55e':a.status==='rejected'?'#ef4444':'#f59e0b')}>{a.status==='approved'?'ONAYLI':a.status==='rejected'?'RED':'BEKLİYOR'}</span></td>
                    <td style={{ ...tdS, color:'var(--text3)', fontSize:'.8rem' }}>{new Date(a.created_at).toLocaleDateString('tr-TR')}</td>
                    <td style={tdS}>{a.status==='pending'?(<div style={{ display:'flex',gap:'.4rem' }}><button onClick={()=>handleAction(a.id,'approve')} disabled={busy===a.id} style={{ ...btnS('#22c55e','#fff'), opacity:busy===a.id?.5:1 }}>✓ ONAYLA</button><button onClick={()=>handleAction(a.id,'reject')} disabled={busy===a.id} style={{ ...btnS('#ef4444','#fff'), opacity:busy===a.id?.5:1 }}>✕ RED</button></div>):'—'}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        /* ========== VATANDAŞLAR TAB ========== */
        citizens.length === 0 ? <p style={{ color:'var(--text3)',textAlign:'center',padding:'3rem' }}>Henüz vatandaş yok.</p> : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%',borderCollapse:'collapse',fontSize:'.9rem' }}>
              <thead><tr style={{ borderBottom:'1px solid var(--border2)' }}>
                {['Ad Soyad','E-posta','Vatandaşlık No','Erişim Kodu','Ülke','Alan','Tarih','İşlem'].map(h=><th key={h} style={thS}>{h}</th>)}
              </tr></thead>
              <tbody>{citizens.map(c=>(
                <tr key={c.id} style={{ borderBottom:'1px solid var(--border)' }}>
                  <td style={{ ...tdS, color:'var(--text)', fontWeight:600 }}>{c.first_name} {c.last_name}</td>
                  <td style={{ ...tdS, color:'var(--text2)', fontSize:'.85rem' }}>{c.email}</td>
                  <td style={{ ...tdS }}><span style={{ fontFamily:'var(--font-display)', color:'var(--gold)', letterSpacing:'.1em', fontSize:'.9rem' }}>{c.citizenship_number}</span></td>
                  <td style={tdS}>
                    {editCode?.id === c.id ? (
                      <div style={{ display:'flex',gap:'.3rem',alignItems:'center' }}>
                        <input value={editCode.code} onChange={e=>setEditCode({id:c.id,code:e.target.value})} style={{ width:140,padding:'4px 8px',fontSize:'.8rem' }} />
                        <button onClick={saveCode} style={btnS('#22c55e','#fff')}>✓</button>
                        <button onClick={()=>setEditCode(null)} style={btnS('transparent','var(--text3)')}>✕</button>
                      </div>
                    ) : (
                      <div style={{ display:'flex',alignItems:'center',gap:'.5rem' }}>
                        <span style={{ fontFamily:'var(--font-display)', color:'var(--teal2)', letterSpacing:'.08em', fontSize:'.85rem', background:'rgba(26,138,122,.1)', padding:'3px 8px' }}>{c.access_code || '—'}</span>
                        <button onClick={()=>setEditCode({id:c.id,code:c.access_code||''})} title="Düzenle" style={{ background:'transparent',border:'none',color:'var(--text3)',cursor:'pointer',fontSize:'.8rem' }}>✎</button>
                        <button onClick={()=>navigator.clipboard.writeText(c.access_code||'')} title="Kopyala" style={{ background:'transparent',border:'none',color:'var(--text3)',cursor:'pointer',fontSize:'.8rem' }}>📋</button>
                      </div>
                    )}
                  </td>
                  <td style={{ ...tdS, color:'var(--text2)' }}>{c.country}</td>
                  <td style={{ ...tdS, color:'var(--teal2)', fontSize:'.85rem' }}>{c.science_field}</td>
                  <td style={{ ...tdS, color:'var(--text3)', fontSize:'.8rem' }}>{new Date(c.created_at).toLocaleDateString('tr-TR')}</td>
                  <td style={tdS}>
                    <div style={{ display:'flex',gap:'.3rem' }}>
                      <button onClick={()=>regenerateCode(c.id)} disabled={busy===c.id} style={{ ...btnS('var(--navy3)','var(--teal2)'), border:'1px solid var(--border)', opacity:busy===c.id?.5:1 }}>🔄 YENİ KOD</button>
                      <button onClick={()=>deleteCitizen(c.id,`${c.first_name} ${c.last_name}`)} disabled={busy===c.id} style={{ ...btnS('transparent','#ef4444'), border:'1px solid rgba(239,68,68,.3)', opacity:busy===c.id?.5:1 }}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
