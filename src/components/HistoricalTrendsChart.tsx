import React, { useState } from 'react';
import { TrendingUp, BarChart2, Calendar } from 'lucide-react';
import { formatMoney } from '../lib/currency';

interface HistoricalTrendsChartProps {
  entries: any[];
  currencyCode: string;
  isDarkMode: boolean;
}

export const HistoricalTrendsChart: React.FC<HistoricalTrendsChartProps> = ({
  entries,
  currencyCode,
  isDarkMode,
}) => {
  const [monthsCount, setMonthsCount] = useState<number>(6);

  // Generate last N months data
  const generateMonthsData = () => {
    const now = new Date();
    const data = [];

    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleString('default', { month: 'short', year: '2-digit' });

      // Filter entries for this month
      const monthEntries = entries.filter((e) => {
        if (!e.date) return false;
        const entryDate = new Date(e.date);
        return entryDate.getFullYear() === d.getFullYear() && entryDate.getMonth() === d.getMonth();
      });

      const income = monthEntries
        .filter((e) => e.type === 'income')
        .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

      const expenses = monthEntries
        .filter((e) => e.type === 'expense')
        .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

      const net = income - expenses;

      data.push({
        label: monthLabel,
        income,
        expenses,
        net,
      });
    }

    return data;
  };

  const monthsData = generateMonthsData();
  const maxVal = Math.max(1, ...monthsData.map((d) => Math.max(d.income, d.expenses)));

  return (
    <div
      className={`p-6 rounded-3xl border shadow-xl transition-all ${
        isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
            <TrendingUp size={26} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Multi-Month Cash Flow & Net Worth Trends</h2>
            <p className="text-xs opacity-75">Compare historical income vs. expenses over time</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {[3, 6, 12].map((cnt) => (
            <button
              key={cnt}
              onClick={() => setMonthsCount(cnt)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                monthsCount === cnt
                  ? 'bg-blue-600 text-white shadow'
                  : isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cnt} Months
            </button>
          ))}
        </div>
      </div>

      {/* SVG Bar / Line Chart */}
      <div className="space-y-4">
        <div className="h-64 flex items-end justify-between gap-2 pt-6 px-2 border-b border-gray-200/20">
          {monthsData.map((item, idx) => {
            const incPct = (item.income / maxVal) * 100;
            const expPct = (item.expenses / maxVal) * 100;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                {/* Tooltip on hover */}
                <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 text-white text-[10px] p-2 rounded-lg pointer-events-none whitespace-nowrap z-20 shadow-xl">
                  <div>Inc: {formatMoney(item.income, currencyCode)}</div>
                  <div>Exp: {formatMoney(item.expenses, currencyCode)}</div>
                  <div className="font-bold text-emerald-300">Net: {formatMoney(item.net, currencyCode)}</div>
                </div>

                <div className="w-full flex items-end justify-center space-x-1.5 h-full">
                  {/* Income Bar */}
                  <div
                    className="w-3/8 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md transition-all duration-500 hover:opacity-90"
                    style={{ height: `${Math.max(4, incPct)}%` }}
                  />
                  {/* Expense Bar */}
                  <div
                    className="w-3/8 bg-gradient-to-t from-red-600 to-red-400 rounded-t-md transition-all duration-500 hover:opacity-90"
                    style={{ height: `${Math.max(4, expPct)}%` }}
                  />
                </div>

                <span className="text-[11px] font-bold mt-2 opacity-75">{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex justify-center space-x-6 text-xs font-semibold pt-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded bg-emerald-500" />
            <span>Income</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span>Expenses</span>
          </div>
        </div>
      </div>
    </div>
  );
};
