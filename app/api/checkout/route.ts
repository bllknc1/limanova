import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, first_name, last_name, country, science_field, vision } = body;

    // Save application to database
    await supabaseAdmin.from('applications').upsert({
      email, first_name, last_name, country, science_field, vision,
      payment_status: 'unpaid', status: 'pending',
    }, { onConflict: 'email' });

    // Create Stripe checkout session
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
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
