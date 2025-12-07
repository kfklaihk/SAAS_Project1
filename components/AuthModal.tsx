'use client';

import { useState } from 'react';
import PasswordInput from './PasswordInput';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string, password: string) => Promise<void>;
  mode: 'signin' | 'signup';
}

export default function AuthModal({
  isOpen,
  onClose,
  onSubmit,
  mode,
}: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(email, password);
      // Reset form on success
      setEmail('');
      setPassword('');
      onClose();
    } catch (error) {
      // Error is already handled by parent
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-sm shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          {mode === 'signin' ? 'Sign In' : 'Sign Up'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <PasswordInput
            value={password}
            onChange={setPassword}
            placeholder="Password (min 6 chars)"
            className="w-full"
          />
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition"
              disabled={loading}
            >
              {loading
                ? mode === 'signin'
                  ? 'Signing In...'
                  : 'Signing Up...'
                : mode === 'signin'
                ? 'Sign In'
                : 'Sign Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
