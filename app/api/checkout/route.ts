import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' });

// Supabase client - service role varsa onu kullan, yoksa anon key ile devam et
function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  if (serviceKey && serviceKey.length > 50) {
    console.log('[Checkout] Using service_role key');
    return createClient(url, serviceKey);
  }
  console.log('[Checkout] WARNING: service_role key missing, using anon key');
  return createClient(url, anonKey);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, first_name, last_name, country, science_field, vision } = body;

    console.log('[Checkout] Received application:', { email, first_name, last_name });

    // Supabase'e kaydet
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('applications').upsert({
      email, first_name, last_name, country, science_field, vision,
      payment_status: 'unpaid', status: 'pending',
    }, { onConflict: 'email' }).select();

    if (error) {
      console.error('[Checkout] Supabase INSERT error:', JSON.stringify(error));
      // Supabase hatası olsa bile Stripe'a devam et (kullanıcıyı engelleme)
    } else {
      console.log('[Checkout] Supabase INSERT success:', JSON.stringify(data));
    }

    // Stripe Checkout oturumu oluştur
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Limanova Founding Support',
            description: 'One-time founding contribution for Limanova citizenship application.',
          },
          unit_amount: 1000,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/tr/citizenship/success?session_id={CHECKOUT_SESSION_ID}&email=${encodeURIComponent(email)}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/tr/citizenship`,
      metadata: { email, name: `${first_name} ${last_name}` },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('[Checkout] FATAL error:', err.message, err.stack);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
