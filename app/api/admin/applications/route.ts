import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const ADMIN_SECRET = 'limanova-derin-devlet-2026';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

// GET — Tüm başvuruları getir
export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret');
  if (secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ applications: data });
}

// POST — Başvuruyu onayla veya reddet
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret');
  if (secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { applicationId, action } = await req.json();
  if (!applicationId || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const supabase = getSupabase();

  if (action === 'reject') {
    const { error } = await supabase
      .from('applications')
      .update({ status: 'rejected' })
      .eq('id', applicationId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, action: 'rejected' });
  }

  // APPROVE — başvuruyu onayla ve citizens tablosuna taşı
  const { data: app, error: fetchErr } = await supabase
    .from('applications')
    .select('*')
    .eq('id', applicationId)
    .single();

  if (fetchErr || !app) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }

  // Citizens tablosuna ekle (citizenship_number otomatik trigger ile oluşur)
  const { data: citizen, error: citizenErr } = await supabase
    .from('citizens')
    .insert({
      first_name: app.first_name,
      last_name: app.last_name,
      email: app.email,
      country: app.country,
      science_field: app.science_field,
      vision: app.vision,
      status: 'approved',
    })
    .select()
    .single();

  if (citizenErr) {
    return NextResponse.json({ error: `Citizen insert failed: ${citizenErr.message}` }, { status: 500 });
  }

  // Başvuru durumunu güncelle
  await supabase
    .from('applications')
    .update({ status: 'approved' })
    .eq('id', applicationId);

  return NextResponse.json({ ok: true, action: 'approved', citizen });
}
