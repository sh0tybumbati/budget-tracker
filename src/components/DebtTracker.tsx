import React, { useState } from 'react';
import { CreditCard, PlusCircle, Trash2, Edit2, CheckCircle2, DollarSign } from 'lucide-react';
import { DebtItem, INITIAL_DEBTS } from '../lib/debts';
import { formatMoney } from '../lib/currency';

interface DebtTrackerProps {
  debts: DebtItem[];
  totalSavings?: number;
  onUpdateDebts: (updatedDebts: DebtItem[]) => void;
  currencyCode: string;
  isDarkMode: boolean;
}

export const DebtTracker: React.FC<DebtTrackerProps> = ({
  debts = INITIAL_DEBTS,
  totalSavings = 0,
  onUpdateDebts,
  currencyCode,
  isDarkMode,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [paymentModalDebt, setPaymentModalDebt] = useState<DebtItem | null>(null);

  const [newName, setNewName] = useState('');
  const [newTotal, setNewTotal] = useState('');
  const [newRemaining, setNewRemaining] = useState('');
  const [newMinPayment, setNewMinPayment] = useState('');
  const [newInterest, setNewInterest] = useState('');

  const [paymentAmount, setPaymentAmount] = useState('');

  const debtsList = Array.isArray(debts) && debts.length > 0 ? debts : INITIAL_DEBTS;

  const totalOriginalDebt = debtsList.reduce((sum, d) => sum + (parseFloat(d.totalBalance as any) || 0), 0);
  const totalRemainingDebt = debtsList.reduce((sum, d) => sum + (parseFloat(d.remainingBalance as any) || 0), 0);
  const totalPaidOff = Math.max(0, totalOriginalDebt - totalRemainingDebt);
  const overallPayoffPct = totalOriginalDebt > 0 ? (totalPaidOff / totalOriginalDebt) * 100 : 100;

  const handleCreateDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newRemaining) return;

    const tot = parseFloat(newTotal) || parseFloat(newRemaining) || 0;
    const rem = parseFloat(newRemaining) || 0;

    const newDebt: DebtItem = {
      id: `debt-${Date.now()}`,
      name: newName.trim(),
      totalBalance: tot,
      remainingBalance: rem,
      minimumPayment: parseFloat(newMinPayment) || 0,
      interestRate: parseFloat(newInterest) || 0,
      color: 'bg-red-500',
    };

    onUpdateDebts([...debtsList, newDebt]);
    setNewName('');
    setNewTotal('');
    setNewRemaining('');
    setNewMinPayment('');
    setNewInterest('');
    setIsAddModalOpen(false);
  };

  const handleApplyPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalDebt || !paymentAmount) return;

    const payAmt = parseFloat(paymentAmount) || 0;
    const updated = debtsList.map((d) => {
      if (d.id === paymentModalDebt.id) {
        const newRem = Math.max(0, (parseFloat(d.remainingBalance as any) || 0) - payAmt);
        return { ...d, remainingBalance: newRem };
      }
      return d;
    });

    onUpdateDebts(updated);
    setPaymentAmount('');
    setPaymentModalDebt(null);
  };

  const handleDeleteDebt = (id: string) => {
    if (confirm('Are you sure you want to remove this debt item?')) {
      onUpdateDebts(debtsList.filter((d) => d.id !== id));
    }
  };

  return (
    <div
      className={`p-6 rounded-3xl border shadow-xl transition-all ${
        isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl">
            <CreditCard size={26} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Debt & Loan Payoff Tracker</h2>
            <p className="text-xs opacity-75">Track outstanding liabilities and accelerate your journey to becoming debt-free</p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow flex items-center space-x-1.5 cursor-pointer"
        >
          <PlusCircle size={16} />
          <span>Add Debt / Loan</span>
        </button>
      </div>

      {/* Summary Banner */}
      <div
        className={`p-5 rounded-2xl border mb-6 ${
          isDarkMode
            ? 'bg-gradient-to-r from-red-900/30 to-amber-900/30 border-red-800/40'
            : 'bg-gradient-to-r from-red-50 to-amber-50 border-red-200'
        }`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider opacity-75">Net Worth (Assets - Debt)</span>
            <div className={`text-2xl font-black mt-1 ${totalSavings - totalRemainingDebt >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {formatMoney(totalSavings - totalRemainingDebt, currencyCode)}
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider opacity-75">Total Remaining Debt</span>
            <div className="text-2xl font-black text-red-500 mt-1">{formatMoney(totalRemainingDebt, currencyCode)}</div>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider opacity-75">Total Debt Paid Off</span>
            <div className="text-2xl font-black text-emerald-500 mt-1">{formatMoney(totalPaidOff, currencyCode)}</div>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider opacity-75">Payoff Progress</span>
            <div className="text-2xl font-black text-blue-500 mt-1">{overallPayoffPct.toFixed(1)}%</div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className={`w-full h-3 rounded-full overflow-hidden mt-4 ${isDarkMode ? 'bg-gray-800' : 'bg-slate-200'}`}>
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700 shadow"
            style={{ width: `${Math.min(overallPayoffPct, 100)}%` }}
          />
        </div>
      </div>

      {/* Debts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {debtsList.map((debt) => {
          const tot = parseFloat(debt.totalBalance as any) || 0;
          const rem = parseFloat(debt.remainingBalance as any) || 0;
          const paid = Math.max(0, tot - rem);
          const pct = tot > 0 ? (paid / tot) * 100 : 100;

          return (
            <div
              key={debt.id}
              className={`p-4.5 rounded-2xl border transition-all ${
                isDarkMode ? 'bg-gray-700/40 border-gray-600' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-base">{debt.name}</h3>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setPaymentModalDebt(debt)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    <DollarSign size={14} />
                    <span>Make Payment</span>
                  </button>
                  <button
                    onClick={() => handleDeleteDebt(debt.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-baseline mb-2">
                <span className="text-lg font-black text-red-500">
                  {formatMoney(rem, currencyCode)} <span className="text-xs font-normal text-slate-400">remaining</span>
                </span>
                <span className="text-xs opacity-75">
                  Original: <strong>{formatMoney(tot, currencyCode)}</strong>
                </span>
              </div>

              {/* Progress Bar */}
              <div className={`w-full h-2.5 rounded-full overflow-hidden mb-2 ${isDarkMode ? 'bg-gray-800' : 'bg-slate-200'}`}>
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-xs opacity-75 font-semibold">
                <span>{pct.toFixed(1)}% Paid Off</span>
                <span>{rem === 0 ? '🎉 Completely Paid Off!' : `Min Payment: ${formatMoney(debt.minimumPayment, currencyCode)}`}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Debt Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className={`w-full max-w-md p-6 rounded-2xl shadow-2xl border ${
              isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <CreditCard className="text-red-500" size={20} />
              <span>Add Debt / Loan Item</span>
            </h3>

            <form onSubmit={handleCreateDebt} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
                  Debt Name & Emoji
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. 💳 Credit Card or 🚗 Car Loan"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
                    Remaining Balance
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newRemaining}
                    onChange={(e) => setNewRemaining(e.target.value)}
                    placeholder="25000"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
                    Original Balance
                  </label>
                  <input
                    type="number"
                    value={newTotal}
                    onChange={(e) => setNewTotal(e.target.value)}
                    placeholder="50000"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
                  Minimum Monthly Payment
                </label>
                <input
                  type="number"
                  value={newMinPayment}
                  onChange={(e) => setNewMinPayment(e.target.value)}
                  placeholder="2500"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium cursor-pointer ${
                    isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow cursor-pointer"
                >
                  Save Debt Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {paymentModalDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className={`w-full max-w-sm p-6 rounded-2xl shadow-2xl border ${
              isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <h3 className="text-lg font-bold mb-2">Record Payment: {paymentModalDebt.name}</h3>
            <p className="text-xs opacity-75 mb-4">
              Current remaining balance: <strong>{formatMoney(paymentModalDebt.remainingBalance, currencyCode)}</strong>
            </p>

            <form onSubmit={handleApplyPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
                  Payment Amount
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="3000"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setPaymentModalDebt(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium cursor-pointer ${
                    isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow cursor-pointer"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
