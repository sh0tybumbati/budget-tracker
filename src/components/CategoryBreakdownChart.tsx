import React, { useState } from 'react';
import { PieChart as PieIcon, BarChart2, TrendingUp, TrendingDown, Layers } from 'lucide-react';
import { formatMoney } from '../lib/currency';

interface Entry {
  id: string;
  label: string;
  amount: number | string;
  type: 'income' | 'expense';
  category?: string;
  [key: string]: any;
}

interface CategoryBreakdownChartProps {
  entries: Entry[];
  currencyCode: string;
  isDarkMode: boolean;
  categoryDefinitions: {
    income: Record<string, { label: string; color: string }>;
    expense: Record<string, { label: string; color: string }>;
  };
}

export const CategoryBreakdownChart: React.FC<CategoryBreakdownChartProps> = ({
  entries,
  currencyCode,
  isDarkMode,
  categoryDefinitions,
}) => {
  const [chartType, setChartType] = useState<'donut' | 'bars'>('donut');
  const [activeSegment, setActiveSegment] = useState<string | null>(null);

  // Group entries by type and category
  const expenseEntries = entries.filter((e) => e.type === 'expense');
  const incomeEntries = entries.filter((e) => e.type === 'income');

  const totalExpense = expenseEntries.reduce((sum, e) => sum + (parseFloat(e.amount as any) || 0), 0);
  const totalIncome = incomeEntries.reduce((sum, e) => sum + (parseFloat(e.amount as any) || 0), 0);

  // Calculate totals per category
  const categoryTotals: Record<string, { label: string; color: string; amount: number; percentage: number }> = {};

  expenseEntries.forEach((e) => {
    const catKey = e.category || 'miscellaneous';
    const amount = parseFloat(e.amount as any) || 0;
    const catDef = categoryDefinitions.expense[catKey] || { label: catKey, color: 'bg-gray-500' };

    if (!categoryTotals[catKey]) {
      categoryTotals[catKey] = {
        label: catDef.label,
        color: catDef.color,
        amount: 0,
        percentage: 0,
      };
    }
    categoryTotals[catKey].amount += amount;
  });

  const sortedCategories = Object.entries(categoryTotals)
    .map(([key, data]) => ({
      key,
      ...data,
      percentage: totalExpense > 0 ? (data.amount / totalExpense) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Color palette for SVG segments
  const colorMap: Record<string, string> = {
    'bg-amber-700': '#b45309',
    'bg-red-500': '#ef4444',
    'bg-lime-500': '#84cc16',
    'bg-blue-500': '#3b82f6',
    'bg-green-500': '#22c55e',
    'bg-purple-500': '#a855f7',
    'bg-pink-500': '#ec4899',
    'bg-indigo-500': '#6366f1',
    'bg-yellow-500': '#eab308',
    'bg-rose-500': '#f43f5e',
    'bg-cyan-500': '#06b6d4',
    'bg-slate-500': '#64748b',
    'bg-gray-500': '#6b7280',
    'bg-teal-500': '#14b8a6',
    'bg-orange-500': '#f97316',
  };

  // Generate SVG Donut slices
  let cumulativeAngle = 0;
  const donutSlices = sortedCategories.map((cat) => {
    const angle = (cat.percentage / 100) * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;
    const endAngle = cumulativeAngle;

    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const outerRadius = 80;
    const innerRadius = 52;

    const x1 = 100 + outerRadius * Math.cos(startRad);
    const y1 = 100 + outerRadius * Math.sin(startRad);
    const x2 = 100 + outerRadius * Math.cos(endRad);
    const y2 = 100 + outerRadius * Math.sin(endRad);

    const x3 = 100 + innerRadius * Math.cos(endRad);
    const y3 = 100 + innerRadius * Math.sin(endRad);
    const x4 = 100 + innerRadius * Math.cos(startRad);
    const y4 = 100 + innerRadius * Math.sin(startRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathData = [
      `M ${x1} ${y1}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
      'Z',
    ].join(' ');

    return {
      ...cat,
      pathData,
      hexColor: colorMap[cat.color] || '#6b7280',
    };
  });

  if (entries.length === 0) {
    return (
      <div className={`rounded-2xl p-6 shadow-lg border text-center transition-all ${
        isDarkMode ? 'bg-gray-800/80 border-gray-700/50 text-gray-400' : 'bg-white/80 border-white/20 text-slate-500'
      }`}>
        <Layers className="mx-auto mb-2 opacity-50" size={32} />
        <p className="text-sm font-medium">No budget entries found yet.</p>
        <p className="text-xs opacity-75 mt-1">Add income or expense entries above to see interactive visual analytics.</p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl p-6 shadow-lg border transition-all duration-300 mb-6 ${
      isDarkMode ? 'bg-gray-800/80 backdrop-blur-sm border-gray-700/50' : 'bg-white/80 backdrop-blur-sm border-white/20'
    }`}>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className={`text-lg font-bold flex items-center gap-2 ${isDarkMode ? 'text-gray-200' : 'text-slate-800'}`}>
            <PieIcon className="text-blue-500" size={20} />
            <span>Expense Category Analytics</span>
          </h2>
          <p className="text-xs opacity-70 mt-0.5">Visual breakdown of your total expense allocation</p>
        </div>

        <div className={`flex items-center p-1 rounded-xl border text-xs font-semibold ${
          isDarkMode ? 'bg-gray-700/60 border-gray-600' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            onClick={() => setChartType('donut')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              chartType === 'donut'
                ? isDarkMode ? 'bg-gray-600 text-white shadow' : 'bg-white text-slate-800 shadow'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            <PieIcon size={14} />
            <span>Donut Chart</span>
          </button>
          <button
            onClick={() => setChartType('bars')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              chartType === 'bars'
                ? isDarkMode ? 'bg-gray-600 text-white shadow' : 'bg-white text-slate-800 shadow'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            <BarChart2 size={14} />
            <span>Bar Breakdown</span>
          </button>
        </div>
      </div>

      {sortedCategories.length === 0 ? (
        <div className="text-center py-8 opacity-70 text-sm">
          No expenses recorded to analyze yet.
        </div>
      ) : chartType === 'donut' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* SVG Donut Chart */}
          <div className="relative flex justify-center items-center py-2">
            <svg viewBox="0 0 200 200" className="w-56 h-56 transform -rotate-90">
              {donutSlices.map((slice) => (
                <path
                  key={slice.key}
                  d={slice.pathData}
                  fill={slice.hexColor}
                  className="transition-all duration-200 cursor-pointer hover:opacity-80 hover:scale-105 transform origin-center"
                  onMouseEnter={() => setActiveSegment(slice.key)}
                  onMouseLeave={() => setActiveSegment(null)}
                  style={{
                    transformOrigin: '100px 100px',
                    filter: activeSegment === slice.key ? 'drop-shadow(0px 0px 6px rgba(0,0,0,0.3))' : 'none',
                  }}
                />
              ))}
            </svg>

            {/* Donut Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-xs uppercase font-semibold tracking-wider opacity-60">Total Expenses</span>
              <span className={`text-xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                {formatMoney(totalExpense, currencyCode)}
              </span>
              {activeSegment && (
                <span className="text-xs font-semibold text-blue-500 mt-0.5 max-w-[110px] truncate">
                  {categoryTotals[activeSegment]?.label}
                </span>
              )}
            </div>
          </div>

          {/* Interactive Legend List */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {sortedCategories.map((cat) => (
              <div
                key={cat.key}
                onMouseEnter={() => setActiveSegment(cat.key)}
                onMouseLeave={() => setActiveSegment(null)}
                className={`flex items-center justify-between p-2.5 rounded-xl transition-colors cursor-pointer ${
                  activeSegment === cat.key
                    ? isDarkMode ? 'bg-gray-700' : 'bg-slate-100'
                    : 'hover:bg-gray-700/30'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className={`w-3.5 h-3.5 rounded-full shrink-0 ${cat.color}`} />
                  <span className={`text-xs font-medium truncate ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                    {cat.label}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-xs font-bold block ${isDarkMode ? 'text-gray-200' : 'text-slate-800'}`}>
                    {formatMoney(cat.amount, currencyCode)}
                  </span>
                  <span className="text-[10px] opacity-60 font-semibold">{cat.percentage.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Bar Breakdown View */
        <div className="space-y-4">
          {sortedCategories.map((cat) => (
            <div key={cat.key} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className={`font-semibold ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                  {cat.label}
                </span>
                <span className="font-bold">
                  {formatMoney(cat.amount, currencyCode)}{' '}
                  <span className="opacity-60 text-[11px]">({cat.percentage.toFixed(1)}%)</span>
                </span>
              </div>
              <div className={`w-full h-3 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
                <div
                  className={`h-full rounded-full transition-all duration-500 ${cat.color}`}
                  style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
