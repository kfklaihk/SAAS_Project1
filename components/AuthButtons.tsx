// /components/AuthButtons.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ensureProfile } from '@/lib/auth';
import AuthModal from './AuthModal';

export default function AuthButtons({ session }: { session: any }) {
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);

  const onSignIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message);
      return;
    }
    const user = data.user;
    if (user) await ensureProfile({ id: user.id, email: user.email });
    alert('Signed in!');
  };

  const onSignUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert(error.message);
      return;
    }
    const user = data.user;
    if (user) await ensureProfile({ id: user.id, email: user.email });
    alert('Account created! Check your email for confirmation if required.');
  };

  const onSignOut = async () => {
    await supabase.auth.signOut();
    alert('Signed out.');
  };

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        <span className="hidden sm:inline text-sm text-gray-600">
          {session.user.email}
        </span>
        <button
          className="px-3 py-1 rounded border hover:bg-gray-100"
          onClick={onSignOut}
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <button
          className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition"
          onClick={() => setIsSignInModalOpen(true)}
        >
          Sign In
        </button>
        <button
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-medium transition"
          onClick={() => setIsSignUpModalOpen(true)}
        >
          Sign Up
        </button>
      </div>
      <AuthModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
        onSubmit={onSignIn}
        mode="signin"
      />
      <AuthModal
        isOpen={isSignUpModalOpen}
        onClose={() => setIsSignUpModalOpen(false)}
        onSubmit={onSignUp}
        mode="signup"
      />
    </>
  );
}
