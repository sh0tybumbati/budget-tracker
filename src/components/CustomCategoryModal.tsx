import React, { useState } from 'react';
import { X, PlusCircle, Tag, Palette } from 'lucide-react';

interface CustomCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCategory: (type: 'income' | 'expense', key: string, label: string, color: string) => void;
  isDarkMode: boolean;
}

const COLOR_OPTIONS = [
  { name: 'Red', class: 'bg-red-500' },
  { name: 'Orange', class: 'bg-orange-500' },
  { name: 'Amber', class: 'bg-amber-600' },
  { name: 'Yellow', class: 'bg-yellow-500' },
  { name: 'Lime', class: 'bg-lime-500' },
  { name: 'Green', class: 'bg-green-500' },
  { name: 'Emerald', class: 'bg-emerald-500' },
  { name: 'Teal', class: 'bg-teal-500' },
  { name: 'Cyan', class: 'bg-cyan-500' },
  { name: 'Blue', class: 'bg-blue-500' },
  { name: 'Indigo', class: 'bg-indigo-500' },
  { name: 'Purple', class: 'bg-purple-500' },
  { name: 'Pink', class: 'bg-pink-500' },
  { name: 'Rose', class: 'bg-rose-500' },
  { name: 'Slate', class: 'bg-slate-500' },
];

export const CustomCategoryModal: React.FC<CustomCategoryModalProps> = ({
  isOpen,
  onClose,
  onAddCategory,
  isDarkMode,
}) => {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [label, setLabel] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-purple-500');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    const key = label.toLowerCase().replace(/[^a-z0-9]/g, '-');
    onAddCategory(type, key, label.trim(), selectedColor);
    setLabel('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-md p-6 rounded-2xl shadow-2xl border transition-all ${
          isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-gray-200/20 mb-5">
          <div className="flex items-center space-x-2">
            <Tag className="text-purple-500" size={24} />
            <h3 className="text-xl font-bold">Add Custom Category</h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
              Category Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all ${
                  type === 'expense'
                    ? 'bg-red-500 text-white border-red-500 shadow-md shadow-red-500/20'
                    : isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-300'
                    : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                Expense Category
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all ${
                  type === 'income'
                    ? 'bg-green-500 text-white border-green-500 shadow-md shadow-green-500/20'
                    : isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-300'
                    : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                Income Category
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
              Category Name & Emoji
            </label>
            <input
              type="text"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. 🐶 Pet Supplies or 🎮 Gaming"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                isDarkMode
                  ? 'bg-gray-700/60 border-gray-600 focus:ring-purple-500 text-white placeholder-gray-400'
                  : 'bg-slate-50 border-slate-200 focus:ring-purple-500 text-slate-800 placeholder-slate-400'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2 opacity-80 flex items-center gap-1.5">
              <Palette size={14} />
              <span>Theme Color Tag</span>
            </label>
            <div className="flex flex-wrap gap-2.5 max-h-32 overflow-y-auto p-1">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.class}
                  type="button"
                  onClick={() => setSelectedColor(c.class)}
                  className={`w-7 h-7 rounded-full transition-transform ${c.class} ${
                    selectedColor === c.class ? 'ring-4 ring-purple-400 scale-110' : 'hover:scale-105 opacity-80'
                  }`}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div className="pt-3 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-500/25 transition-all flex items-center space-x-1.5"
            >
              <PlusCircle size={16} />
              <span>Add Category</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
