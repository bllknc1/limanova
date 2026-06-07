import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

// Helper: verify session
async function verifyCitizen(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;

  const supabase = getSupabase();

  const { data: session } = await supabase
    .from('citizen_sessions')
    .select('citizen_id, expires_at')
    .eq('token', token)
    .single();

  if (!session || new Date(session.expires_at) < new Date()) return null;

  return session.citizen_id as string;
}

// PUT — Profili güncelle
export async function PUT(req: NextRequest) {
  const citizenId = await verifyCitizen(req);
  if (!citizenId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  // Sadece izin verilen alanlar güncellenir
  const allowedFields: Record<string, any> = {};
  if (body.bio !== undefined) allowedFields.bio = body.bio;
  if (body.projects !== undefined) allowedFields.projects = body.projects;
  if (body.titles !== undefined) allowedFields.titles = body.titles;

  if (Object.keys(allowedFields).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('citizens')
    .update(allowedFields)
    .eq('id', citizenId)
    .select()
    .single();

  if (error) {
    console.error('[Profile] Update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, citizen: data });
}
