'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

type Citizen = {
  id: string;
  citizenship_number: string;
  first_name: string;
  last_name: string;
  email: string;
  country: string;
  science_field: string;
  vision: string;
  bio: string | null;
  projects: string | null;
  titles: string | null;
  avatar_url: string | null;
  created_at: string;
};

export default function ProfilePage() {
  const t = useTranslations('profile');
  const locale = useLocale();
  const router = useRouter();
  const [citizen, setCitizen] = useState<Citizen | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ bio: '', projects: '', titles: '' });

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('lmn_token');
    if (!token) {
      router.push(`/${locale}/login`);
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) {
        localStorage.removeItem('lmn_token');
        localStorage.removeItem('lmn_citizen');
        window.dispatchEvent(new Event('lmn_auth_change'));
        router.push(`/${locale}/login`);
        return;
      }

      const data = await res.json();
      setCitizen(data.citizen);
      setEditForm({
        bio: data.citizen.bio || '',
        projects: data.citizen.projects || '',
        titles: data.citizen.titles || '',
      });
    } catch {
      router.push(`/${locale}/login`);
    }
    setLoading(false);
  }, [locale, router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem('lmn_token');
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        const data = await res.json();
        setCitizen(prev => prev ? { ...prev, ...editForm } : prev);
        setEditing(false);
      }
    } catch {}
    setSaving(false);
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('lmn_token');
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    localStorage.removeItem('lmn_token');
    localStorage.removeItem('lmn_citizen');
    window.dispatchEvent(new Event('lmn_auth_change'));
    router.push(`/${locale}`);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main style={{
          minHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--text3)',
            letterSpacing: '.2em',
            fontSize: '.9rem',
          }}>
            ⚗ ...
          </div>
        </main>
      </>
    );
  }

  if (!citizen) return null;

  const memberDate = new Date(citizen.created_at).toLocaleDateString(
    locale === 'tr' ? 'tr-TR' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '90vh', padding: '2rem' }}>
        <div style={{
          maxWidth: 800,
          margin: '2rem auto',
        }}>
          {/* Header card */}
          <div style={{
            background: 'var(--navy2)',
            border: '1px solid var(--border)',
            padding: '2.5rem',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '1.5rem',
          }}>
            {/* Gold accent line */}
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0,
              height: 3,
              background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
            }} />

            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '2rem',
              flexWrap: 'wrap',
            }}>
              {/* Avatar */}
              <div style={{
                width: 100, height: 100,
                border: '2px solid var(--border2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                background: 'radial-gradient(circle, rgba(201,162,39,0.1), transparent)',
                flexShrink: 0,
              }}>
                {citizen.first_name[0]}{citizen.last_name[0]}
              </div>

              <div style={{ flex: 1, minWidth: 200 }}>
                <h1 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.8rem',
                  color: 'var(--gold)',
                  letterSpacing: '.08em',
                  marginBottom: '.3rem',
                }}>
                  {citizen.first_name} {citizen.last_name}
                </h1>
                <p style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '.75rem',
                  color: 'var(--teal2)',
                  letterSpacing: '.25em',
                  textTransform: 'uppercase',
                  marginBottom: '1rem',
                }}>
                  {t('title')}
                </p>

                {/* Info grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                  gap: '1rem',
                }}>
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '.6rem',
                      letterSpacing: '.2em',
                      color: 'var(--text3)',
                      textTransform: 'uppercase',
                      marginBottom: '.2rem',
                    }}>
                      {t('citizenship_no')}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.1rem',
                      color: 'var(--gold)',
                      letterSpacing: '.1em',
                    }}>
                      {citizen.citizenship_number}
                    </div>
                  </div>
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '.6rem',
                      letterSpacing: '.2em',
                      color: 'var(--text3)',
                      textTransform: 'uppercase',
                      marginBottom: '.2rem',
                    }}>
                      {t('field')}
                    </div>
                    <div style={{ color: 'var(--teal2)', fontSize: '.95rem' }}>
                      {citizen.science_field}
                    </div>
                  </div>
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '.6rem',
                      letterSpacing: '.2em',
                      color: 'var(--text3)',
                      textTransform: 'uppercase',
                      marginBottom: '.2rem',
                    }}>
                      {t('country')}
                    </div>
                    <div style={{ color: 'var(--text2)', fontSize: '.95rem' }}>
                      {citizen.country}
                    </div>
                  </div>
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '.6rem',
                      letterSpacing: '.2em',
                      color: 'var(--text3)',
                      textTransform: 'uppercase',
                      marginBottom: '.2rem',
                    }}>
                      {t('member_since')}
                    </div>
                    <div style={{ color: 'var(--text2)', fontSize: '.95rem' }}>
                      {memberDate}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '.5rem', flexShrink: 0 }}>
                <button onClick={() => setEditing(!editing)} style={{
                  background: 'transparent',
                  border: '1px solid var(--border2)',
                  color: 'var(--gold)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '.65rem',
                  letterSpacing: '.1em',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  transition: '.2s',
                }}>
                  {editing ? '✕' : '✎'} {editing ? t('cancel') : t('edit')}
                </button>
                <button onClick={handleLogout} style={{
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  color: 'var(--text3)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '.65rem',
                  letterSpacing: '.1em',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  transition: '.2s',
                }}>
                  {t('logout')}
                </button>
              </div>
            </div>
          </div>

          {/* Vision */}
          <div style={{
            background: 'var(--navy2)',
            border: '1px solid var(--border)',
            padding: '2rem',
            marginBottom: '1.5rem',
          }}>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '.75rem',
              letterSpacing: '.15em',
              color: 'var(--gold)',
              marginBottom: '1rem',
              textTransform: 'uppercase',
            }}>
              {t('vision')}
            </h3>
            <p style={{
              color: 'var(--text2)',
              fontSize: '1.05rem',
              lineHeight: 1.7,
              fontStyle: 'italic',
            }}>
              &ldquo;{citizen.vision}&rdquo;
            </p>
          </div>

          {/* Bio / Projects / Titles — editable */}
          {editing ? (
            <div style={{
              background: 'var(--navy2)',
              border: '1px solid var(--gold-dim)',
              padding: '2rem',
            }}>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '.75rem',
                letterSpacing: '.15em',
                color: 'var(--gold)',
                marginBottom: '1.5rem',
                textTransform: 'uppercase',
              }}>
                {t('edit')}
              </h3>

              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{
                  display: 'block',
                  fontFamily: 'var(--font-display)',
                  fontSize: '.65rem',
                  letterSpacing: '.15em',
                  color: 'var(--text3)',
                  marginBottom: '.4rem',
                  textTransform: 'uppercase',
                }}>
                  {t('bio')}
                </label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{
                  display: 'block',
                  fontFamily: 'var(--font-display)',
                  fontSize: '.65rem',
                  letterSpacing: '.15em',
                  color: 'var(--text3)',
                  marginBottom: '.4rem',
                  textTransform: 'uppercase',
                }}>
                  {t('projects')}
                </label>
                <textarea
                  value={editForm.projects}
                  onChange={(e) => setEditForm(prev => ({ ...prev, projects: e.target.value }))}
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontFamily: 'var(--font-display)',
                  fontSize: '.65rem',
                  letterSpacing: '.15em',
                  color: 'var(--text3)',
                  marginBottom: '.4rem',
                  textTransform: 'uppercase',
                }}>
                  {t('titles')}
                </label>
                <textarea
                  value={editForm.titles}
                  onChange={(e) => setEditForm(prev => ({ ...prev, titles: e.target.value }))}
                  rows={2}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button onClick={handleSave} disabled={saving} style={{
                background: saving ? 'var(--gold-dim)' : 'var(--gold)',
                color: 'var(--navy)',
                fontFamily: 'var(--font-display)',
                fontSize: '.75rem',
                letterSpacing: '.1em',
                padding: '10px 28px',
                border: 'none',
                cursor: saving ? 'wait' : 'pointer',
                transition: '.2s',
              }}>
                {saving ? '...' : t('save')}
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
            }}>
              {/* Bio */}
              <div style={{
                background: 'var(--navy2)',
                border: '1px solid var(--border)',
                padding: '1.5rem',
              }}>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '.7rem',
                  letterSpacing: '.15em',
                  color: 'var(--gold)',
                  marginBottom: '.8rem',
                  textTransform: 'uppercase',
                }}>
                  {t('bio')}
                </h3>
                <p style={{
                  color: citizen.bio ? 'var(--text2)' : 'var(--text3)',
                  fontSize: '.9rem',
                  lineHeight: 1.6,
                  fontStyle: citizen.bio ? 'normal' : 'italic',
                }}>
                  {citizen.bio || t('empty_bio')}
                </p>
              </div>

              {/* Projects */}
              <div style={{
                background: 'var(--navy2)',
                border: '1px solid var(--border)',
                padding: '1.5rem',
              }}>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '.7rem',
                  letterSpacing: '.15em',
                  color: 'var(--gold)',
                  marginBottom: '.8rem',
                  textTransform: 'uppercase',
                }}>
                  {t('projects')}
                </h3>
                <p style={{
                  color: citizen.projects ? 'var(--text2)' : 'var(--text3)',
                  fontSize: '.9rem',
                  lineHeight: 1.6,
                  fontStyle: citizen.projects ? 'normal' : 'italic',
                }}>
                  {citizen.projects || t('empty_projects')}
                </p>
              </div>

              {/* Titles */}
              <div style={{
                background: 'var(--navy2)',
                border: '1px solid var(--border)',
                padding: '1.5rem',
              }}>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '.7rem',
                  letterSpacing: '.15em',
                  color: 'var(--gold)',
                  marginBottom: '.8rem',
                  textTransform: 'uppercase',
                }}>
                  {t('titles')}
                </h3>
                <p style={{
                  color: citizen.titles ? 'var(--text2)' : 'var(--text3)',
                  fontSize: '.9rem',
                  lineHeight: 1.6,
                  fontStyle: citizen.titles ? 'normal' : 'italic',
                }}>
                  {citizen.titles || t('empty_titles')}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
