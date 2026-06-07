import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

// GET — Session token ile vatandaş bilgisi getir
export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'No token' }, { status: 401 });
  }

  const supabase = getSupabase();

  // Find valid session
  const { data: session, error: sessionErr } = await supabase
    .from('citizen_sessions')
    .select('citizen_id, expires_at')
    .eq('token', token)
    .single();

  if (sessionErr || !session) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  // Check expiration
  if (new Date(session.expires_at) < new Date()) {
    // Clean up expired session
    await supabase.from('citizen_sessions').delete().eq('token', token);
    return NextResponse.json({ error: 'Session expired' }, { status: 401 });
  }

  // Get citizen data
  const { data: citizen, error: citizenErr } = await supabase
    .from('citizens')
    .select('*')
    .eq('id', session.citizen_id)
    .single();

  if (citizenErr || !citizen) {
    return NextResponse.json({ error: 'Citizen not found' }, { status: 404 });
  }

  return NextResponse.json({
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
  });
}
