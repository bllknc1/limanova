import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

// POST — Vatandaş giriş
export async function POST(req: NextRequest) {
  const { email, accessCode } = await req.json();

  if (!email || !accessCode) {
    return NextResponse.json({ error: 'Email and access code required' }, { status: 400 });
  }

  const supabase = getSupabase();

  // Find citizen by email
  const { data: citizen, error } = await supabase
    .from('citizens')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .eq('access_code', accessCode.trim())
    .single();

  if (error || !citizen) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // Generate a session token
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

  // Save session
  const { error: sessionErr } = await supabase
    .from('citizen_sessions')
    .insert({
      citizen_id: citizen.id,
      token: sessionToken,
      expires_at: expiresAt,
    });

  if (sessionErr) {
    console.error('[Auth] Session creation error:', sessionErr);
    return NextResponse.json({ error: 'Session creation failed' }, { status: 500 });
  }

  // Return citizen data + token
  const response = NextResponse.json({
    ok: true,
    citizen: {
      id: citizen.id,
      citizenship_number: citizen.citizenship_number,
      first_name: citizen.first_name,
      last_name: citizen.last_name,
      email: citizen.email,
      country: citizen.country,
      science_field: citizen.science_field,
      vision: citizen.vision,
      bio: citizen.bio,
      projects: citizen.projects,
      titles: citizen.titles,
      avatar_url: citizen.avatar_url,
      created_at: citizen.created_at,
    },
    token: sessionToken,
  });

  return response;
}
