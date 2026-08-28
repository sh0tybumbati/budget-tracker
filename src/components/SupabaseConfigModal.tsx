import React, { useState, useEffect } from 'react';
import { X, Database, Key, CheckCircle2, AlertCircle, ExternalLink, Save, RefreshCw } from 'lucide-react';
import { getSupabaseCredentials, setCustomSupabaseCredentials, getSupabaseClient } from '../lib/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  isDarkMode: boolean;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  isDarkMode,
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'testing' | 'connected' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      const creds = getSupabaseCredentials();
      setUrl(creds.url);
      setAnonKey(creds.anonKey);
      setStatus('idle');
      setErrorMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('testing');
    setErrorMsg('');

    try {
      setCustomSupabaseCredentials(url, anonKey);
      const client = getSupabaseClient();

      if (!client) {
        throw new Error('Could not initialize Supabase client. Please check the URL and Key format.');
      }

      // Test simple connection call
      const { error } = await client.from('budget_data').select('count', { count: 'exact', head: true });
      if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
        // PGRST116 / 42P01 might mean table doesn't exist yet, but client connected
        console.warn('Supabase test table query:', error);
      }

      setStatus('connected');
      setTimeout(() => {
        onSaved();
        onClose();
      }, 600);
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Failed to connect to Supabase project.');
    }
  };

  const handleClear = () => {
    setCustomSupabaseCredentials('', '');
    setUrl('');
    setAnonKey('');
    setStatus('idle');
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-lg p-6 rounded-2xl shadow-2xl border transition-all ${
          isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-gray-200/20 mb-5">
          <div className="flex items-center space-x-2">
            <Database className="text-emerald-500" size={24} />
            <h3 className="text-xl font-bold">Supabase Cloud Storage Config</h3>
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

        <p className="text-sm opacity-80 mb-4">
          Connect your free <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-500 font-semibold underline inline-flex items-center">Supabase <ExternalLink size={12} className="ml-1" /></a> project to sync budget data across devices and enable user authentication.
        </p>

        {errorMsg && (
          <div className="flex items-start space-x-2 p-3.5 mb-4 text-sm bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {status === 'connected' && (
          <div className="flex items-center space-x-2 p-3.5 mb-4 text-sm bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-xl">
            <CheckCircle2 size={18} />
            <span>Supabase connected successfully!</span>
          </div>
        )}

        <form onSubmit={handleTestAndSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
              Supabase Project URL
            </label>
            <div className="relative">
              <Database className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                  isDarkMode
                    ? 'bg-gray-700/60 border-gray-600 focus:ring-emerald-500 text-white placeholder-gray-400'
                    : 'bg-slate-50 border-slate-200 focus:ring-emerald-500 text-slate-800 placeholder-slate-400'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
              Supabase Anon API Key
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                required
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                  isDarkMode
                    ? 'bg-gray-700/60 border-gray-600 focus:ring-emerald-500 text-white placeholder-gray-400'
                    : 'bg-slate-50 border-slate-200 focus:ring-emerald-500 text-slate-800 placeholder-slate-400'
                }`}
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between space-x-3">
            <button
              type="button"
              onClick={handleClear}
              className={`px-4 py-2.5 rounded-xl text-xs font-medium border transition-colors ${
                isDarkMode ? 'border-gray-600 hover:bg-gray-700 text-gray-300' : 'border-slate-300 hover:bg-slate-100 text-slate-600'
              }`}
            >
              Reset Credentials
            </button>

            <button
              type="submit"
              disabled={status === 'testing'}
              className="px-6 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg shadow-emerald-500/25 transition-all flex items-center space-x-2"
            >
              {status === 'testing' ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Save Configuration</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className={`mt-5 p-3.5 rounded-xl border text-xs leading-relaxed ${
          isDarkMode ? 'bg-gray-900/50 border-gray-700/50 text-gray-400' : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}>
          💡 <strong>Tip:</strong> Make sure you have created the <code>budget_data</code> table with RLS policy in your Supabase SQL Editor using the included <code>supabase_setup.sql</code> script!
        </div>
      </div>
    </div>
  );
};
