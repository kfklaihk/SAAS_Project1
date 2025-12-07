// /lib/stripe.ts
import Stripe from 'stripe';
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

// Use your real price IDs from Stripe Dashboard
export const PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_MONTHLY_ID!,
  annual: process.env.STRIPE_PRICE_ANNUAL_ID!,
};