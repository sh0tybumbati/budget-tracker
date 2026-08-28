import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, AlertCircle } from 'lucide-react';
import { formatMoney } from '../lib/currency';

interface FinancialCalendarProps {
  entries: any[];
  currencyCode: string;
  isDarkMode: boolean;
}

export const FinancialCalendar: React.FC<FinancialCalendarProps> = ({
  entries,
  currencyCode,
  isDarkMode,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Map entries by day
  const getEntriesForDay = (day: number) => {
    return entries.filter((e) => {
      if (!e.dueDate && !e.date) return false;
      const d = new Date(e.dueDate || e.date);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  };

  const daysGrid = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    daysGrid.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysGrid.push(d);
  }

  return (
    <div
      className={`p-6 rounded-3xl border shadow-xl transition-all ${
        isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl">
            <CalendarIcon size={26} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Interactive Financial Calendar</h2>
            <p className="text-xs opacity-75">View paydays, upcoming bill due dates, and automated savings events</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={prevMonth}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isDarkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-slate-100 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <ChevronLeft size={18} />
          </button>
          <span className="font-bold text-sm min-w-[120px] text-center">{monthName}</span>
          <button
            onClick={nextMonth}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isDarkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-slate-100 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold opacity-60">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {daysGrid.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="h-24 rounded-2xl bg-transparent" />;
          }

          const dayEntries = getEntriesForDay(day);
          const isToday =
            new Date().getDate() === day &&
            new Date().getMonth() === month &&
            new Date().getFullYear() === year;

          return (
            <div
              key={day}
              className={`h-24 p-2 rounded-2xl border transition-all flex flex-col justify-between overflow-hidden ${
                isToday
                  ? isDarkMode
                    ? 'border-indigo-500 bg-indigo-900/20'
                    : 'border-indigo-500 bg-indigo-50/50'
                  : isDarkMode
                  ? 'bg-gray-700/30 border-gray-700'
                  : 'bg-slate-50/60 border-slate-200'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className={`text-xs font-black ${isToday ? 'text-indigo-500 font-extrabold' : ''}`}>{day}</span>
                {dayEntries.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                )}
              </div>

              <div className="space-y-1 overflow-y-auto max-h-16 no-scrollbar">
                {dayEntries.map((e) => (
                  <div
                    key={e.id}
                    className={`text-[9px] font-bold p-1 rounded-md flex items-center justify-between ${
                      e.type === 'income'
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : e.type === 'savings'
                        ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20'
                        : 'bg-red-500/10 text-red-600 border border-red-500/20'
                    }`}
                  >
                    <span className="truncate max-w-[50px]">{e.label}</span>
                    <span>{formatMoney(e.amount, currencyCode)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
