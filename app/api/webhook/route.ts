import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' });

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  if (serviceKey && serviceKey.length > 50) {
    return createClient(url, serviceKey);
  }
  console.log('[Webhook] WARNING: service_role key missing, using anon key');
  return createClient(url, anonKey);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error('[Webhook] Signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  console.log('[Webhook] Event received:', event.type);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.metadata?.email || session.customer_email;
    console.log('[Webhook] Payment completed for:', email);

    if (email) {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('applications')
        .update({ payment_status: 'paid', payment_intent_id: session.payment_intent as string })
        .eq('email', email)
        .select();

      if (error) {
        console.error('[Webhook] Supabase UPDATE error:', JSON.stringify(error));
      } else {
        console.log('[Webhook] Supabase UPDATE success:', JSON.stringify(data));
      }
    }
  }

  return NextResponse.json({ received: true });
}
