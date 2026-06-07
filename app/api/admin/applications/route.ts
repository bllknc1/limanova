import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const ADMIN_SECRET = 'limanova-derin-devlet-2026';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

function generateAccessCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'LMN-';
  for (let i = 0; i < 8; i++) {
    code += chars[crypto.randomInt(chars.length)];
    if (i === 3) code += '-';
  }
  return code;
}

// GET — Tüm başvuruları + vatandaşları getir
export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret');
  if (secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();

  // Fetch applications
  const { data: applications, error: appErr } = await supabase
    .from('applications')
    .select('*')
    .order('created_at', { ascending: false });

  // Fetch citizens with access codes
  const { data: citizens, error: citErr } = await supabase
    .from('citizens')
    .select('*')
    .order('created_at', { ascending: false });

  if (appErr) return NextResponse.json({ error: appErr.message }, { status: 500 });

  return NextResponse.json({
    applications: applications || [],
    citizens: citizens || [],
  });
}

// POST — Başvuruyu onayla/reddet veya vatandaş erişim kodunu değiştir
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret');
  if (secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { applicationId, action, citizenId, newAction } = body;

  const supabase = getSupabase();

  // --- Vatandaş erişim kodu yenileme ---
  if (newAction === 'regenerate_code' && citizenId) {
    const newCode = generateAccessCode();
    const { error } = await supabase
      .from('citizens')
      .update({ access_code: newCode })
      .eq('id', citizenId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, newAction: 'code_regenerated', accessCode: newCode });
  }

  // --- Vatandaş erişim kodunu manuel ayarlama ---
  if (newAction === 'set_code' && citizenId && body.code) {
    const { error } = await supabase
      .from('citizens')
      .update({ access_code: body.code })
      .eq('id', citizenId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, newAction: 'code_set' });
  }

  // --- Vatandaş silme ---
  if (newAction === 'delete_citizen' && citizenId) {
    // Delete sessions first
    await supabase.from('citizen_sessions').delete().eq('citizen_id', citizenId);
    const { error } = await supabase.from('citizens').delete().eq('id', citizenId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, newAction: 'citizen_deleted' });
  }

  // --- Başvuru işlemleri ---
  if (!applicationId || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  if (action === 'reject') {
    const { error } = await supabase
      .from('applications')
      .update({ status: 'rejected' })
      .eq('id', applicationId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, action: 'rejected' });
  }

  // APPROVE
  const { data: app, error: fetchErr } = await supabase
    .from('applications')
    .select('*')
    .eq('id', applicationId)
    .single();

  if (fetchErr || !app) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }

  const accessCode = generateAccessCode();

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
      access_code: accessCode,
    })
    .select()
    .single();

  if (citizenErr) {
    return NextResponse.json({ error: `Citizen insert failed: ${citizenErr.message}` }, { status: 500 });
  }

  await supabase
    .from('applications')
    .update({ status: 'approved' })
    .eq('id', applicationId);

  return NextResponse.json({
    ok: true,
    action: 'approved',
    citizen,
    accessCode,
  });
}
