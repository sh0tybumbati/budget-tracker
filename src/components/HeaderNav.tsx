import React from 'react';
import { LayoutDashboard, Calendar, PiggyBank, Settings, Sun, Moon, LogIn, LogOut, Cloud } from 'lucide-react';
import { CURRENCIES } from '../lib/currency';

export type DashboardTab = 'overview' | 'entries' | 'savings' | 'settings';

interface HeaderNavProps {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  currencyCode: string;
  setCurrencyCode: (code: string) => void;
  currentUser: any;
  onOpenAuthModal: () => void;
  onOpenConfigModal: () => void;
  onSignOut: () => void;
  supabaseConfigured: boolean;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeTab,
  setActiveTab,
  currencyCode,
  setCurrencyCode,
  currentUser,
  onOpenAuthModal,
  onOpenConfigModal,
  onSignOut,
  supabaseConfigured,
  isDarkMode,
  setIsDarkMode,
}) => {
  return (
    <header className="mb-6 space-y-4">
      {/* Top Bar: Title & User Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1
            className={`text-3xl font-black bg-gradient-to-r bg-clip-text text-transparent ${
              isDarkMode ? 'from-white via-gray-200 to-gray-400' : 'from-slate-900 via-slate-800 to-slate-600'
            }`}
          >
            Budget Tracker
          </h1>
          <p className="text-xs opacity-70">Track income, expenses, and cumulative savings</p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Currency Selector */}
          <select
            value={currencyCode}
            onChange={(e) => setCurrencyCode(e.target.value)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer focus:outline-none ${
              isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-slate-200 text-slate-800'
            }`}
            title="Select Currency"
          >
            {Object.values(CURRENCIES).map((c) => (
              <option key={c.code} value={c.code}>
                {c.symbol} ({c.code})
              </option>
            ))}
          </select>

          {/* User Auth */}
          {currentUser ? (
            <div className="flex items-center space-x-1.5">
              <div
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center border ${
                  isDarkMode
                    ? 'bg-emerald-900/40 border-emerald-700/50 text-emerald-300'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}
              >
                <Cloud size={14} className="mr-1.5 text-emerald-500" />
                <span className="max-w-[130px] truncate">{currentUser.email}</span>
              </div>
              <button
                onClick={onSignOut}
                className={`p-2 rounded-xl text-xs font-medium border transition-colors ${
                  isDarkMode
                    ? 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-300'
                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow transition-all flex items-center space-x-1.5"
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </button>
          )}

          {/* Supabase Config */}
          <button
            onClick={onOpenConfigModal}
            className={`p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center border ${
              supabaseConfigured
                ? isDarkMode
                  ? 'bg-gray-800 border-emerald-500/40 text-emerald-400'
                  : 'bg-white border-emerald-500/40 text-emerald-600'
                : isDarkMode
                ? 'bg-gray-800 border-amber-500/40 text-amber-400'
                : 'bg-white border-amber-500/40 text-amber-600'
            }`}
            title="Cloud Storage Config"
          >
            <Settings size={18} />
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center border ${
              isDarkMode
                ? 'bg-gray-800 hover:bg-gray-700 border-gray-700'
                : 'bg-white hover:bg-slate-100 border-slate-200'
            }`}
            title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {isDarkMode ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-slate-600" />}
          </button>
        </div>
      </div>

      {/* Main Dashboard Navigation Tabs */}
      <div
        className={`flex items-center p-1.5 rounded-2xl border shadow-lg overflow-x-auto ${
          isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white border-slate-200'
        }`}
      >
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
            activeTab === 'overview'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
              : isDarkMode
              ? 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <LayoutDashboard size={16} />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('entries')}
          className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
            activeTab === 'entries'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
              : isDarkMode
              ? 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar size={16} />
          <span>Budget & Entries</span>
        </button>

        <button
          onClick={() => setActiveTab('savings')}
          className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
            activeTab === 'savings'
              ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md'
              : isDarkMode
              ? 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <PiggyBank size={16} />
          <span>Savings Goals</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
            activeTab === 'settings'
              ? 'bg-gradient-to-r from-gray-700 to-gray-800 text-white shadow-md'
              : isDarkMode
              ? 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Settings size={16} />
          <span>Data & Settings</span>
        </button>
      </div>
    </header>
  );
};
