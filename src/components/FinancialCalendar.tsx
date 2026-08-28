import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, AlertCircle, X, Bell } from 'lucide-react';
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
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

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
      if (!e.dueDate && !e.date && !e.billingDate && !e.startDate) return false;
      const dateStr = e.dueDate || e.billingDate || e.startDate || e.date;
      const d = new Date(dateStr);
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

  const selectedDayEntries = selectedDay ? getEntriesForDay(selectedDay) : [];

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
            <p className="text-xs opacity-75">Click any date to inspect scheduled paydays, due bills, and savings events</p>
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
              onClick={() => setSelectedDay(day)}
              className={`h-24 p-2 rounded-2xl border transition-all flex flex-col justify-between overflow-hidden cursor-pointer hover:scale-[1.02] hover:shadow-lg ${
                isToday
                  ? isDarkMode
                    ? 'border-indigo-500 bg-indigo-900/30 shadow-indigo-500/20'
                    : 'border-indigo-500 bg-indigo-50/70 shadow-indigo-500/20'
                  : isDarkMode
                  ? 'bg-gray-700/30 border-gray-700 hover:border-gray-500'
                  : 'bg-slate-50/60 border-slate-200 hover:border-slate-400'
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
                        : e.type === 'debt'
                        ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                        : 'bg-red-500/10 text-red-600 border border-red-500/20'
                    }`}
                  >
                    <span className="truncate max-w-[45px]">{e.label}</span>
                    <span>{formatMoney(e.amount, currencyCode)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Day Popover Drawer */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className={`w-full max-w-md p-6 rounded-3xl shadow-2xl border ${
              isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200/20">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="text-indigo-500" size={22} />
                <h3 className="text-lg font-bold">
                  {new Date(year, month, selectedDay).toLocaleDateString('default', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-1.5 rounded-xl hover:bg-gray-700/50 cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {selectedDayEntries.length === 0 ? (
              <div className="py-8 text-center opacity-75">
                <Clock className="mx-auto mb-2 opacity-50" size={32} />
                <p className="text-sm font-semibold">No scheduled events or bills for this date.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {selectedDayEntries.map((e) => (
                  <div
                    key={e.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between ${
                      e.type === 'income'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'
                        : e.type === 'savings'
                        ? 'bg-purple-500/10 border-purple-500/30 text-purple-600'
                        : e.type === 'debt'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-600'
                        : 'bg-red-500/10 border-red-500/30 text-red-600'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-sm">{e.label}</h4>
                      <span className="text-[11px] opacity-75 uppercase font-semibold">{e.type}</span>
                    </div>
                    <span className="text-base font-black">{formatMoney(e.amount, currencyCode)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
