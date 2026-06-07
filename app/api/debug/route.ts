import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results: Record<string, any> = {};

  // 1. Environment variables kontrolü
  results.env = {
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ SET' : '❌ MISSING',
    ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ SET' : '❌ MISSING',
    SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? `✅ SET (${process.env.SUPABASE_SERVICE_ROLE_KEY!.length} chars)` : '❌ MISSING',
    STRIPE_SECRET: process.env.STRIPE_SECRET_KEY ? '✅ SET' : '❌ MISSING',
  };

  // 2. Service Role Key ile test
  try {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceKey) {
      const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey);
      
      // SELECT test
      const { data: selectData, error: selectError } = await supabaseAdmin
        .from('applications')
        .select('*');
      
      results.serviceRole_SELECT = selectError 
        ? { error: selectError.message, code: selectError.code, details: selectError.details }
        : { success: true, count: selectData?.length, data: selectData };

      // INSERT test
      const { data: insertData, error: insertError } = await supabaseAdmin
        .from('applications')
        .upsert({
          email: 'debug-test@limanova.com',
          first_name: 'Debug',
          last_name: 'Test',
          country: 'Test',
          science_field: 'Test',
          vision: 'Debug test insert',
          payment_status: 'unpaid',
          status: 'pending',
        }, { onConflict: 'email' })
        .select();

      results.serviceRole_INSERT = insertError
        ? { error: insertError.message, code: insertError.code, details: insertError.details }
        : { success: true, data: insertData };
    } else {
      results.serviceRole = 'SKIPPED - key missing';
    }
  } catch (e: any) {
    results.serviceRole_ERROR = e.message;
  }

  // 3. Anon Key ile test
  try {
    const supabaseAnon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabaseAnon
      .from('applications')
      .insert({
        email: 'debug-anon-test@limanova.com',
        first_name: 'AnonDebug',
        last_name: 'Test',
        country: 'Test',
        science_field: 'Test',
        vision: 'Anon key debug test',
        payment_status: 'unpaid',
        status: 'pending',
      })
      .select();

    results.anonKey_INSERT = error
      ? { error: error.message, code: error.code, details: error.details }
      : { success: true, data };
  } catch (e: any) {
    results.anonKey_ERROR = e.message;
  }

  return NextResponse.json(results, { status: 200 });
}
