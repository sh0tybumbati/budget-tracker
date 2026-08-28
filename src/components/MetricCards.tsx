import React from 'react';
import { DollarSign, ArrowUpRight, ArrowDownRight, Scale, PiggyBank, TrendingUp } from 'lucide-react';
import { formatMoney } from '../lib/currency';

interface MetricCardsProps {
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  totalSavings: number;
  currencyCode: string;
  isDarkMode: boolean;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  totalIncome,
  totalExpenses,
  netAmount,
  totalSavings,
  currencyCode,
  isDarkMode,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Income Card */}
      <div
        className={`p-5 rounded-3xl border shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-2xl ${
          isDarkMode
            ? 'bg-gradient-to-br from-emerald-900/50 via-emerald-900/20 to-gray-800/80 border-emerald-700/50 text-white shadow-emerald-950/20'
            : 'bg-gradient-to-br from-emerald-50 via-emerald-100/40 to-white border-emerald-200/80 text-slate-800 shadow-emerald-500/10'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-extrabold uppercase tracking-wider opacity-75">Total Income</span>
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-500 shadow-sm">
            <ArrowUpRight size={20} />
          </div>
        </div>
        <div className="text-3xl font-black text-emerald-500 tracking-tight">{formatMoney(totalIncome, currencyCode)}</div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-emerald-500/10 text-[11px] font-semibold opacity-75">
          <span>Logged for current period</span>
          <span className="text-emerald-500 font-extrabold">Active</span>
        </div>
      </div>

      {/* Total Expenses Card */}
      <div
        className={`p-5 rounded-3xl border shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-2xl ${
          isDarkMode
            ? 'bg-gradient-to-br from-red-900/50 via-red-900/20 to-gray-800/80 border-red-700/50 text-white shadow-red-950/20'
            : 'bg-gradient-to-br from-red-50 via-red-100/40 to-white border-red-200/80 text-slate-800 shadow-red-500/10'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-extrabold uppercase tracking-wider opacity-75">Total Expenses</span>
          <div className="p-2.5 rounded-2xl bg-red-500/20 text-red-500 shadow-sm">
            <ArrowDownRight size={20} />
          </div>
        </div>
        <div className="text-3xl font-black text-red-500 tracking-tight">{formatMoney(totalExpenses, currencyCode)}</div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-red-500/10 text-[11px] font-semibold opacity-75">
          <span>Outgoing period cash flow</span>
          <span className="text-red-500 font-extrabold">Tracked</span>
        </div>
      </div>

      {/* Net Balance Card */}
      <div
        className={`p-5 rounded-3xl border shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-2xl ${
          isDarkMode
            ? 'bg-gradient-to-br from-blue-900/50 via-blue-900/20 to-gray-800/80 border-blue-700/50 text-white shadow-blue-950/20'
            : 'bg-gradient-to-br from-blue-50 via-blue-100/40 to-white border-blue-200/80 text-slate-800 shadow-blue-500/10'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-extrabold uppercase tracking-wider opacity-75">Net Cash Flow</span>
          <div className="p-2.5 rounded-2xl bg-blue-500/20 text-blue-500 shadow-sm">
            <Scale size={20} />
          </div>
        </div>
        <div
          className={`text-3xl font-black tracking-tight ${
            netAmount >= 0 ? 'text-blue-500' : 'text-amber-500'
          }`}
        >
          {formatMoney(netAmount, currencyCode)}
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-blue-500/10 text-[11px] font-semibold opacity-75">
          <span>Remaining disposable cash</span>
          <span className={netAmount >= 0 ? 'text-blue-500 font-bold' : 'text-amber-500 font-bold'}>
            {netAmount >= 0 ? 'Surplus 📈' : 'Deficit ⚠️'}
          </span>
        </div>
      </div>

      {/* Cumulative Savings Card */}
      <div
        className={`p-5 rounded-3xl border shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-2xl ${
          isDarkMode
            ? 'bg-gradient-to-br from-purple-900/50 via-purple-900/20 to-gray-800/80 border-purple-700/50 text-white shadow-purple-950/20'
            : 'bg-gradient-to-br from-purple-50 via-purple-100/40 to-white border-purple-200/80 text-slate-800 shadow-purple-500/10'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-extrabold uppercase tracking-wider opacity-75">Total Saved Wealth</span>
          <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-500 shadow-sm">
            <PiggyBank size={20} />
          </div>
        </div>
        <div className="text-3xl font-black text-purple-500 tracking-tight">{formatMoney(totalSavings, currencyCode)}</div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-purple-500/10 text-[11px] font-semibold opacity-75">
          <span>Cumulative goals balance</span>
          <span className="text-purple-500 font-extrabold">Growing 🐖</span>
        </div>
      </div>
    </div>
  );
};
