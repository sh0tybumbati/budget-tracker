import React, { useState } from 'react';
import { X, Mail, Lock, UserPlus, LogIn, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { getSupabaseClient, AuthMode } from '../lib/supabase';

interface SupabaseAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isDarkMode: boolean;
}

export const SupabaseAuthModal: React.FC<SupabaseAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  isDarkMode,
}) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const client = getSupabaseClient();
    if (!client) {
      setErrorMsg('Supabase is not configured. Please check your Supabase credentials.');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'signin') {
        const { error } = await client.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setSuccessMsg('Successfully signed in!');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 500);
      } else {
        const { error, data } = await client.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        if (data.session) {
          setSuccessMsg('Account created and signed in successfully!');
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 500);
        } else {
          setSuccessMsg('Account created! Please check your email to confirm your sign up.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-md p-6 rounded-2xl shadow-2xl border transition-all transform ${
          isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-gray-200/20 mb-5">
          <div className="flex items-center space-x-2">
            {mode === 'signin' ? (
              <LogIn className="text-blue-500" size={24} />
            ) : (
              <UserPlus className="text-emerald-500" size={24} />
            )}
            <h3 className="text-xl font-bold">
              {mode === 'signin' ? 'Sign In to Budget Tracker' : 'Create New Account'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div className="flex items-start space-x-2 p-3.5 mb-4 text-sm bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-start space-x-2 p-3.5 mb-4 text-sm bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-xl">
            <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                  isDarkMode
                    ? 'bg-gray-700/60 border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400'
                    : 'bg-slate-50 border-slate-200 focus:ring-blue-500 focus:border-blue-500 text-slate-800 placeholder-slate-400'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                  isDarkMode
                    ? 'bg-gray-700/60 border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400'
                    : 'bg-slate-50 border-slate-200 focus:ring-blue-500 focus:border-blue-500 text-slate-800 placeholder-slate-400'
                }`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-xl font-medium text-white shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
              mode === 'signin'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-blue-500/25'
                : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-emerald-500/25'
            } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : mode === 'signin' ? (
              <>
                <LogIn size={18} />
                <span>Sign In</span>
              </>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-gray-200/20 text-center text-xs opacity-80">
          {mode === 'signin' ? (
            <p>
              Don't have an account yet?{' '}
              <button
                onClick={() => {
                  setMode('signup');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-blue-500 font-semibold hover:underline"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => {
                  setMode('signin');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-blue-500 font-semibold hover:underline"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
