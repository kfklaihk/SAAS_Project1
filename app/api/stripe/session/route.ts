// /app/api/stripe/session/route.ts
import { NextResponse } from 'next/server';
import { stripe, PRICE_IDS } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  const { plan, userId, email } = await req.json();

  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'Supabase admin client not configured' },
      { status: 500 }
    );
  }

  // Ensure profile has a Stripe customer
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  let customerId = profile?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({ email });
    customerId = customer.id;
    const { error: updateErr } = await supabaseAdmin.from('profiles').update({
      stripe_customer_id: customerId
    }).eq('id', userId);
    
    if (updateErr) {
      console.error('Failed to update stripe_customer_id:', updateErr);
    }
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: plan === 'annual' ? PRICE_IDS.annual : PRICE_IDS.monthly, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?status=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?status=cancel`,
    allow_promotion_codes: true,
    automatic_tax: { enabled: true },
    currency: 'hkd', // or 'usd'
  });

  if (!session.url) {
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: session.url });
}