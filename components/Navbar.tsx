// /components/Navbar.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AuthButtons from './AuthButtons';

export default function Navbar() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub?.subscription?.unsubscribe();
  }, []);

  return (
    <nav className="w-full border-b bg-white">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="inline-block rounded bg-black text-white px-2 py-1 text-sm font-bold">AI</span>
            <span className="text-lg font-semibold">Kevin SAAS Practice 1</span>
          </div>
          <div className="hidden md:flex items-center gap-4">
            {/* Pricing link removed */}
          </div>

        </div>

        <div className="flex items-center gap-3">
          {/* Auth controls (Sign In/Up/Out) */}
          <AuthButtons session={session} />
        </div>
      </div>
    </nav>
  );

}
