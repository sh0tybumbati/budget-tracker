import React, { useState } from 'react';
import { AlertTriangle, AlertOctagon, Plus, Edit2, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { CategoryLimit, calculateCategorySpent } from '../lib/budgetLimits';
import { formatMoney } from '../lib/currency';

interface BudgetLimitsTrackerProps {
  limits: CategoryLimit[];
  entries: any[];
  onUpdateLimits: (updatedLimits: CategoryLimit[]) => void;
  currencyCode: string;
  isDarkMode: boolean;
  getCategoryInfo: (type: string, key: string) => { label: string; color: string };
}

export const BudgetLimitsTracker: React.FC<BudgetLimitsTrackerProps> = ({
  limits,
  entries,
  onUpdateLimits,
  currencyCode,
  isDarkMode,
  getCategoryInfo,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState('groceries');
  const [limitAmount, setLimitAmount] = useState('');

  const handleSaveLimit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCat || !limitAmount) return;

    const amt = parseFloat(limitAmount) || 0;
    const existingIndex = limits.findIndex((l) => l.categoryKey === selectedCat);

    let updated: CategoryLimit[];
    if (existingIndex >= 0) {
      updated = limits.map((l, idx) => (idx === existingIndex ? { ...l, limitAmount: amt } : l));
    } else {
      updated = [...limits, { categoryKey: selectedCat, limitAmount: amt }];
    }

    onUpdateLimits(updated);
    setLimitAmount('');
    setIsModalOpen(false);
  };

  const categories = [
    { key: 'groceries', label: '🛒 Groceries' },
    { key: 'dining', label: '🍕 Dining Out' },
    { key: 'utilities', label: '⚡ Utilities & Bills' },
    { key: 'entertainment', label: '🎬 Entertainment' },
    { key: 'shopping', label: '🛍️ Shopping' },
    { key: 'housing', label: '🏠 Housing & Rent' },
    { key: 'transport', label: '🚗 Transportation' },
    { key: 'health', label: '💊 Healthcare' },
  ];

  return (
    <div
      className={`p-6 rounded-3xl border shadow-xl transition-all ${
        isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
            <ShieldAlert size={26} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Category Spending Caps & Limits</h2>
            <p className="text-xs opacity-75">Track budget limits and receive warning alerts before overspending</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow flex items-center space-x-1.5 cursor-pointer"
        >
          <Plus size={16} />
          <span>Set Budget Limit</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {limits.map((lim) => {
          const spent = calculateCategorySpent(entries, lim.categoryKey);
          const pct = lim.limitAmount > 0 ? (spent / lim.limitAmount) * 100 : 0;
          const catInfo = getCategoryInfo('expense', lim.categoryKey);

          let statusBadge = null;
          let barColor = 'bg-emerald-500';

          if (pct >= 100) {
            barColor = 'bg-red-500';
            statusBadge = (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-red-500/10 text-red-500 border border-red-500/20 flex items-center gap-1">
                <AlertOctagon size={12} />
                <span>EXCEEDED LIMIT</span>
              </span>
            );
          } else if (pct >= 85) {
            barColor = 'bg-amber-500';
            statusBadge = (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1">
                <AlertTriangle size={12} />
                <span>NEAR LIMIT (&gt;85%)</span>
              </span>
            );
          } else {
            statusBadge = (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 size={12} />
                <span>ON TRACK</span>
              </span>
            );
          }

          return (
            <div
              key={lim.categoryKey}
              className={`p-4 rounded-2xl border transition-all ${
                isDarkMode ? 'bg-gray-700/40 border-gray-600' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${catInfo.color || 'bg-amber-500'}`} />
                  <span className="font-bold text-sm">{catInfo.label || lim.categoryKey}</span>
                </div>
                {statusBadge}
              </div>

              <div className="flex justify-between items-baseline text-xs mb-2">
                <span className="font-extrabold text-base">
                  {formatMoney(spent, currencyCode)}
                  <span className="text-xs font-normal opacity-70"> spent</span>
                </span>
                <span className="opacity-75">
                  Cap: <strong>{formatMoney(lim.limitAmount, currencyCode)}</strong>
                </span>
              </div>

              {/* Progress Bar */}
              <div className={`w-full h-2.5 rounded-full overflow-hidden mb-1.5 ${isDarkMode ? 'bg-gray-800' : 'bg-slate-200'}`}>
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] opacity-75 font-semibold">
                <span>{pct.toFixed(1)}% Used</span>
                <span>
                  {spent >= lim.limitAmount
                    ? `Over by ${formatMoney(spent - lim.limitAmount, currencyCode)}`
                    : `Remaining: ${formatMoney(lim.limitAmount - spent, currencyCode)}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className={`w-full max-w-md p-6 rounded-2xl shadow-2xl border ${
              isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <ShieldAlert className="text-amber-500" size={20} />
              <span>Set Category Budget Cap</span>
            </h3>

            <form onSubmit={handleSaveLimit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
                  Select Category
                </label>
                <select
                  value={selectedCat}
                  onChange={(e) => setSelectedCat(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  {categories.map((cat) => (
                    <option key={cat.key} value={cat.key}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
                  Monthly Cap Limit
                </label>
                <input
                  type="number"
                  required
                  min="100"
                  value={limitAmount}
                  onChange={(e) => setLimitAmount(e.target.value)}
                  placeholder="10000"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium cursor-pointer ${
                    isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow cursor-pointer"
                >
                  Save Limit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
