import React from 'react';
import { DollarSign, ArrowUpRight, ArrowDownRight, Scale, PiggyBank } from 'lucide-react';
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
      {/* Total Income */}
      <div
        className={`p-5 rounded-2xl border shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${
          isDarkMode
            ? 'bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 border-emerald-700/40 text-white'
            : 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200 text-slate-800'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider opacity-70">Total Income</span>
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-500">
            <ArrowUpRight size={20} />
          </div>
        </div>
        <div className="text-2xl font-black text-emerald-500">{formatMoney(totalIncome, currencyCode)}</div>
        <p className="text-[11px] opacity-60 mt-1 font-medium">Income logged for current period</p>
      </div>

      {/* Total Expenses */}
      <div
        className={`p-5 rounded-2xl border shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${
          isDarkMode
            ? 'bg-gradient-to-br from-red-900/40 to-red-800/20 border-red-700/40 text-white'
            : 'bg-gradient-to-br from-red-50 to-red-100/50 border-red-200 text-slate-800'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider opacity-70">Total Expenses</span>
          <div className="p-2.5 rounded-xl bg-red-500/20 text-red-500">
            <ArrowDownRight size={20} />
          </div>
        </div>
        <div className="text-2xl font-black text-red-500">{formatMoney(totalExpenses, currencyCode)}</div>
        <p className="text-[11px] opacity-60 mt-1 font-medium">Expenses logged for current period</p>
      </div>

      {/* Net Balance */}
      <div
        className={`p-5 rounded-2xl border shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${
          isDarkMode
            ? 'bg-gradient-to-br from-blue-900/40 to-blue-800/20 border-blue-700/40 text-white'
            : 'bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 text-slate-800'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider opacity-70">Net Cash Flow</span>
          <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-500">
            <Scale size={20} />
          </div>
        </div>
        <div
          className={`text-2xl font-black ${
            netAmount >= 0 ? 'text-blue-500' : 'text-amber-500'
          }`}
        >
          {formatMoney(netAmount, currencyCode)}
        </div>
        <p className="text-[11px] opacity-60 mt-1 font-medium">Remaining period balance</p>
      </div>

      {/* Cumulative Savings */}
      <div
        className={`p-5 rounded-2xl border shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${
          isDarkMode
            ? 'bg-gradient-to-br from-purple-900/40 to-purple-800/20 border-purple-700/40 text-white'
            : 'bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200 text-slate-800'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider opacity-70">Total Savings</span>
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-500">
            <PiggyBank size={20} />
          </div>
        </div>
        <div className="text-2xl font-black text-purple-500">{formatMoney(totalSavings, currencyCode)}</div>
        <p className="text-[11px] opacity-60 mt-1 font-medium">Cumulative wealth accumulated</p>
      </div>
    </div>
  );
};
