// /lib/auth.ts
import { supabaseAdmin } from '@/lib/supabaseClient';

/**
 * Get the user's profile row (includes subscription status).
 * Safe for server-side calls because it uses the service role key.
 */
export async function getProfile(userId: string) {
  if (!userId) return null;
  if (!supabaseAdmin) {
    console.warn('supabaseAdmin not configured. Set SUPABASE_SERVICE_ROLE_KEY in .env.local');
    return null;
  }
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('getProfile error:', error.message);
    return null;
  }
  return data;
}

/**
 * Returns true if the user has an active paid subscription.
 */
export async function isActiveSubscriber(userId: string) {
  const profile = await getProfile(userId);
  return profile?.status === 'active';
}

/**
 * Ensures a profile exists for a Supabase auth user.
 * Call this right after signup/login to keep your `profiles` table in sync.
 */
export async function ensureProfile({
  id,
  email,
}: {
  id: string;
  email?: string | null;
}) {
  if (!supabaseAdmin) {
    console.warn('supabaseAdmin not configured. Set SUPABASE_SERVICE_ROLE_KEY in .env.local');
    return null;
  }
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('ensureProfile read error:', error.message);
    return null;
  }

  if (!data) {
    if (!supabaseAdmin) {
      console.warn('supabaseAdmin not configured. Set SUPABASE_SERVICE_ROLE_KEY in .env.local');
      return null;
    }
    const { data: created, error: insertErr } = await supabaseAdmin
      .from('profiles')
      .insert({
        id,
        email: email ?? null,
        status: 'inactive',
        plan: 'free',
      })
      .select()
      .single();

    if (insertErr) {
      console.error('ensureProfile insert error:', insertErr.message);
      return null;
    }
    return created;
  }
  return data;
}
