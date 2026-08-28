import React, { useState } from 'react';
import { PiggyBank, PlusCircle, TrendingUp, CheckCircle, Target, ArrowUpRight, ArrowDownRight, Edit2, Trash2 } from 'lucide-react';
import { SavingsGoal } from '../lib/savings';
import { formatMoney } from '../lib/currency';

interface SavingsTrackerProps {
  savingsGoals: SavingsGoal[];
  onUpdateGoals: (updatedGoals: SavingsGoal[]) => void;
  currencyCode: string;
  isDarkMode: boolean;
}

export const SavingsTracker: React.FC<SavingsTrackerProps> = ({
  savingsGoals,
  onUpdateGoals,
  currencyCode,
  isDarkMode,
}) => {
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [depositModalGoal, setDepositModalGoal] = useState<SavingsGoal | null>(null);
  const [editModalGoal, setEditModalGoal] = useState<SavingsGoal | null>(null);

  // New goal state
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalInitial, setNewGoalInitial] = useState('');
  const [newGoalColor, setNewGoalColor] = useState('bg-emerald-500');

  // Edit goal state
  const [editGoalName, setEditGoalName] = useState('');
  const [editGoalTarget, setEditGoalTarget] = useState('');
  const [editGoalCurrent, setEditGoalCurrent] = useState('');
  const [editGoalColor, setEditGoalColor] = useState('bg-emerald-500');

  // Deposit/Withdraw state
  const [depositAmount, setDepositAmount] = useState('');
  const [depositType, setDepositType] = useState<'deposit' | 'withdraw'>('deposit');

  const totalSavings = savingsGoals.reduce((sum, g) => sum + (parseFloat(g.currentAmount as any) || 0), 0);
  const totalTarget = savingsGoals.reduce((sum, g) => sum + (parseFloat(g.targetAmount as any) || 0), 0);
  const overallPercentage = totalTarget > 0 ? (totalSavings / totalTarget) * 100 : 0;

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalName.trim() || !newGoalTarget) return;

    const newGoal: SavingsGoal = {
      id: `goal-${Date.now()}`,
      name: newGoalName.trim(),
      targetAmount: parseFloat(newGoalTarget) || 0,
      currentAmount: parseFloat(newGoalInitial) || 0,
      color: newGoalColor,
      createdAt: new Date().toISOString(),
    };

    onUpdateGoals([...savingsGoals, newGoal]);
    setNewGoalName('');
    setNewGoalTarget('');
    setNewGoalInitial('');
    setIsAddGoalModalOpen(false);
  };

  const handleSaveEditGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalGoal || !editGoalName.trim() || !editGoalTarget) return;

    const updated = savingsGoals.map((g) => {
      if (g.id === editModalGoal.id) {
        return {
          ...g,
          name: editGoalName.trim(),
          targetAmount: parseFloat(editGoalTarget) || 0,
          currentAmount: parseFloat(editGoalCurrent) || 0,
          color: editGoalColor,
        };
      }
      return g;
    });

    onUpdateGoals(updated);
    setEditModalGoal(null);
  };

  const handleApplyDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositModalGoal || !depositAmount) return;

    const amt = parseFloat(depositAmount) || 0;
    const change = depositType === 'deposit' ? amt : -amt;

    const updated = savingsGoals.map((g) => {
      if (g.id === depositModalGoal.id) {
        const newAmt = Math.max(0, (parseFloat(g.currentAmount as any) || 0) + change);
        return { ...g, currentAmount: newAmt };
      }
      return g;
    });

    onUpdateGoals(updated);
    setDepositAmount('');
    setDepositModalGoal(null);
  };

  const handleDeleteGoal = (id: string) => {
    if (confirm('Are you sure you want to remove this savings goal?')) {
      onUpdateGoals(savingsGoals.filter((g) => g.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Total Cumulative Savings Header Card */}
      <div
        className={`p-6 rounded-3xl border shadow-xl transition-all ${
          isDarkMode
            ? 'bg-gradient-to-r from-purple-900/60 via-indigo-900/40 to-gray-800 border-purple-700/50 text-white'
            : 'bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-600 text-white shadow-purple-500/20'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
              <PiggyBank size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black">Cumulative Savings</h2>
              <p className="text-xs opacity-80">Track your total saved wealth accumulation over time</p>
            </div>
          </div>

          <button
            onClick={() => setIsAddGoalModalOpen(true)}
            className="px-5 py-3 rounded-xl bg-white text-purple-700 font-bold text-xs shadow-lg hover:bg-opacity-95 transition-all flex items-center space-x-2 cursor-pointer"
          >
            <PlusCircle size={18} />
            <span>Create New Goal</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider opacity-80">Total Saved</span>
            <div className="text-3xl font-black mt-1">{formatMoney(totalSavings, currencyCode)}</div>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider opacity-80">Target Goals Total</span>
            <div className="text-3xl font-black mt-1">{formatMoney(totalTarget, currencyCode)}</div>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider opacity-80">Overall Completion</span>
            <div className="text-3xl font-black mt-1">{overallPercentage.toFixed(1)}%</div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="w-full bg-black/20 h-3.5 rounded-full overflow-hidden mt-4">
          <div
            className="bg-white h-full rounded-full transition-all duration-700 shadow"
            style={{ width: `${Math.min(overallPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Savings Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {savingsGoals.map((goal) => {
          const current = parseFloat(goal.currentAmount as any) || 0;
          const target = parseFloat(goal.targetAmount as any) || 0;
          const pct = target > 0 ? (current / target) * 100 : 0;
          const remaining = Math.max(0, target - current);

          return (
            <div
              key={goal.id}
              className={`p-5 rounded-2xl border shadow-lg transition-all ${
                isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2.5">
                  <div className={`w-3.5 h-3.5 rounded-full ${goal.color}`} />
                  <h3 className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                    {goal.name}
                  </h3>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setDepositModalGoal(goal)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    <PlusCircle size={14} />
                    <span>Deposit / Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditModalGoal(goal);
                      setEditGoalName(goal.name);
                      setEditGoalTarget(goal.targetAmount.toString());
                      setEditGoalCurrent(goal.currentAmount.toString());
                      setEditGoalColor(goal.color);
                    }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 transition-colors cursor-pointer"
                    title="Edit Goal Details"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                    title="Delete Goal"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-baseline mb-2">
                <span className={`text-xl font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  {formatMoney(current, currencyCode)}
                </span>
                <span className="text-xs opacity-70">
                  Target: <strong>{formatMoney(target, currencyCode)}</strong>
                </span>
              </div>

              {/* Progress Bar */}
              <div className={`w-full h-3 rounded-full overflow-hidden mb-2 ${isDarkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
                <div
                  className={`h-full rounded-full transition-all duration-500 ${goal.color}`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-xs opacity-75 font-semibold">
                <span>{pct.toFixed(1)}% Completed</span>
                <span>{remaining === 0 ? '🎉 Goal Achieved!' : `Remaining: ${formatMoney(remaining, currencyCode)}`}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Goal Modal */}
      {isAddGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className={`w-full max-w-md p-6 rounded-2xl shadow-2xl border ${
              isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Target className="text-purple-500" size={20} />
              <span>Create New Savings Goal</span>
            </h3>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
                  Goal Name & Emoji
                </label>
                <input
                  type="text"
                  required
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                  placeholder="e.g. 🚗 New Car or 🏖️ Vacation"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
                  Target Goal Amount
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newGoalTarget}
                  onChange={(e) => setNewGoalTarget(e.target.value)}
                  placeholder="100000"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
                  Initial Saved Amount (Optional)
                </label>
                <input
                  type="number"
                  value={newGoalInitial}
                  onChange={(e) => setNewGoalInitial(e.target.value)}
                  placeholder="0"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddGoalModalOpen(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium cursor-pointer ${
                    isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow cursor-pointer"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Goal Modal */}
      {editModalGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className={`w-full max-w-md p-6 rounded-2xl shadow-2xl border ${
              isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Edit2 className="text-blue-500" size={20} />
              <span>Edit Savings Goal</span>
            </h3>

            <form onSubmit={handleSaveEditGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
                  Goal Name & Emoji
                </label>
                <input
                  type="text"
                  required
                  value={editGoalName}
                  onChange={(e) => setEditGoalName(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
                  Target Goal Amount
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={editGoalTarget}
                  onChange={(e) => setEditGoalTarget(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
                  Current Saved Amount
                </label>
                <input
                  type="number"
                  min="0"
                  value={editGoalCurrent}
                  onChange={(e) => setEditGoalCurrent(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditModalGoal(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium cursor-pointer ${
                    isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {depositModalGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className={`w-full max-w-sm p-6 rounded-2xl shadow-2xl border ${
              isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <h3 className="text-lg font-bold mb-2">Manage Savings: {depositModalGoal.name}</h3>
            <p className="text-xs opacity-75 mb-4">
              Current balance: <strong>{formatMoney(depositModalGoal.currentAmount, currencyCode)}</strong>
            </p>

            <form onSubmit={handleApplyDeposit} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDepositType('deposit')}
                  className={`py-2 text-xs font-bold rounded-xl border ${
                    depositType === 'deposit'
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-300'
                      : 'bg-slate-100 border-slate-200'
                  }`}
                >
                  + Add Deposit
                </button>
                <button
                  type="button"
                  onClick={() => setDepositType('withdraw')}
                  className={`py-2 text-xs font-bold rounded-xl border ${
                    depositType === 'withdraw'
                      ? 'bg-red-500 text-white border-red-500'
                      : isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-300'
                      : 'bg-slate-100 border-slate-200'
                  }`}
                >
                  - Withdraw
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
                  Amount
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="5000"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setDepositModalGoal(null)}
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
                  Apply {depositType === 'deposit' ? 'Deposit' : 'Withdrawal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
