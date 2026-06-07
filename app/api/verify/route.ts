import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: 'No email' }, { status: 400 });

  await supabaseAdmin
    .from('applications')
    .update({ payment_status: 'paid' })
    .eq('email', email);

  return NextResponse.json({ ok: true });
}
