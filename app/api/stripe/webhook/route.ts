// /app/api/stripe/webhook/route.ts
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')!;
  const buf = await req.arrayBuffer();
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      Buffer.from(buf),
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const subscriptionId = session.subscription;
    const customerId = session.customer;

    // Find the profile by customerId and set status active
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customerId);

    if (profiles && profiles.length) {
      await supabaseAdmin
        .from('profiles')
        .update({ status: 'active', plan: 'paid' })
        .eq('id', profiles[0].id);
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as any;
    const customerId = sub.customer;

    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customerId);

    if (profiles && profiles.length) {
      await supabaseAdmin
        .from('profiles')
        .update({ status: 'inactive', plan: 'free' })
        .eq('id', profiles[0].id);
    }
  }

  return NextResponse.json({ received: true });
}