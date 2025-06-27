import React, { useState, useRef, useEffect } from 'react';
import { PlusCircle, Trash2, Calendar, DollarSign, Clock, ChevronLeft, ChevronRight, BarChart3, Edit2, Save, X, Download, Upload, Database, CalendarDays, ArrowUpDown, ArrowUp, ArrowDown, Sun, Moon, CalendarRange, CalendarCheck, Loader2, Wifi, WifiOff, Check, Calculator, Search } from 'lucide-react';

// Category definitions with colors
const INCOME_CATEGORIES = {
  'salary': { label: '💼 Salary/Wages', color: 'bg-blue-500' },
  'freelance': { label: '💻 Freelance/Contract', color: 'bg-purple-500' },
  'investments': { label: '📈 Investments', color: 'bg-green-500' },
  'business': { label: '🏢 Business Revenue', color: 'bg-yellow-500' },
  'side-hustle': { label: '🎯 Side Hustle', color: 'bg-orange-500' },
  'gifts': { label: '🎁 Gifts/Bonuses', color: 'bg-pink-500' },
  'rental': { label: '🏠 Rental Income', color: 'bg-teal-500' },
  'other-income': { label: '❓ Other Income', color: 'bg-gray-500' }
};

const EXPENSE_CATEGORIES = {
  'housing': { label: '🏠 Housing', color: 'bg-amber-700' },
  'food-dining': { label: '🍔 Food & Dining', color: 'bg-red-500' },
  'groceries': { label: '🛒 Groceries', color: 'bg-lime-500' },
  'transportation': { label: '🚗 Transportation', color: 'bg-blue-500' },
  'healthcare': { label: '🏥 Healthcare', color: 'bg-green-500' },
  'entertainment': { label: '🎭 Entertainment', color: 'bg-purple-500' },
  'shopping': { label: '👕 Shopping', color: 'bg-pink-500' },
  'education': { label: '📚 Education', color: 'bg-indigo-500' },
  'financial': { label: '💳 Financial', color: 'bg-yellow-500' },
  'personal-care': { label: '💅 Personal Care', color: 'bg-rose-500' },
  'travel': { label: '✈️ Travel', color: 'bg-cyan-500' },
  'technology': { label: '📱 Technology', color: 'bg-slate-500' },
  'miscellaneous': { label: '🎪 Miscellaneous', color: 'bg-gray-500' }
};

const BudgetTracker = () => {
  const [entries, setEntries] = useState([]);
  const [periodType, setPeriodType] = useState('semimonthly');
  const [currentView, setCurrentView] = useState('current');
  const [timelineStart, setTimelineStart] = useState(0);
  const [editingEntry, setEditingEntry] = useState(null);
  const [timelineCheckedEntries, setTimelineCheckedEntries] = useState({});
  const [entrySortBy, setEntrySortBy] = useState('alphabetical');
  const [entrySortOrder, setEntrySortOrder] = useState('asc');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('idle'); // 'idle', 'saving', 'saved', 'error'
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPeriodOffset, setCurrentPeriodOffset] = useState(0);
  const [singlePeriodSortBy, setSinglePeriodSortBy] = useState('alphabetical');
  const [singlePeriodSearchQuery, setSinglePeriodSearchQuery] = useState('');
  const [adjustmentModal, setAdjustmentModal] = useState(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentNote, setAdjustmentNote] = useState('');
  const fileInputRef = useRef(null);

  // Load data from shared backend on component mount and set up auto-sync
  useEffect(() => {
    const loadData = async (showLoading = false, isInitialLoad = false) => {
      if (showLoading) setIsLoading(true);
      try {
        const apiUrl = window.location.hostname === 'localhost' 
          ? 'http://localhost:3001/api/budget'
          : `http://${window.location.hostname}:3001/api/budget`;
        const response = await fetch(apiUrl);
        if (response.ok) {
          const data = await response.json();
          if (data.entries && Array.isArray(data.entries)) {
            setEntries(data.entries);
          }
          // Only update periodType on initial load, not during auto-sync
          if (data.periodType && isInitialLoad) {
            setPeriodType(data.periodType);
          }
          if (data.timelineCheckedEntries) {
            setTimelineCheckedEntries(data.timelineCheckedEntries);
          }
        }
      } catch (error) {
        console.error('Error loading data from server:', error);
        // Fallback to localStorage if server is unavailable
        const savedData = localStorage.getItem('budgetTrackerData');
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            if (parsedData.entries && Array.isArray(parsedData.entries)) {
              setEntries(parsedData.entries);
            }
            // Only update periodType on initial load, not during auto-sync
            if (parsedData.periodType && isInitialLoad) {
              setPeriodType(parsedData.periodType);
            }
            if (parsedData.timelineCheckedEntries) {
              setTimelineCheckedEntries(parsedData.timelineCheckedEntries);
            }
          } catch (parseError) {
            console.error('Error parsing localStorage data:', parseError);
          }
        }
      } finally {
        if (showLoading) setIsLoading(false);
      }
    };
    
    // Initial load
    loadData(true, true);
    
    // Set up auto-sync every 5 seconds (don't update periodType during auto-sync)
    const syncInterval = setInterval(async () => {
      setAutoSaveStatus('saving');
      try {
        await loadData(false, false);
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      } catch (error) {
        setAutoSaveStatus('error');
        setTimeout(() => setAutoSaveStatus('idle'), 3000);
      }
    }, 5000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(syncInterval);
  }, []);
  const [newEntry, setNewEntry] = useState({
    label: '',
    amount: '',
    type: 'income',
    category: '',
    recurrenceType: 'biweekly',
    startDate: '',
    endDate: '',
    startPeriod: '',
    endPeriod: '',
    billingDate: '',
    isIndefinite: false
  });

  const semiMonthlyPeriodToDates = (periodString) => {
    if (!periodString) return { start: null, end: null };
    
    const [yearMonth, half] = periodString.split('-');
    const [year, month] = yearMonth.split('/').map(Number);
    
    if (half === '1') {
      return {
        start: new Date(year, month - 1, 1),
        end: new Date(year, month - 1, 15)
      };
    } else {
      return {
        start: new Date(year, month - 1, 16),
        end: new Date(year, month, 0)
      };
    }
  };

  const generateSemiMonthlyOptions = () => {
    const options = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    for (let year = currentYear; year <= currentYear + 1; year++) {
      for (let month = 1; month <= 12; month++) {
        const monthName = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long' });
        options.push({
          value: `${year}/${month}-1`,
          label: `${monthName} ${year} - First Cutoff`
        });
        options.push({
          value: `${year}/${month}-2`,
          label: `${monthName} ${year} - Second Cutoff`
        });
      }
    }
    
    return options;
  };

  const getEntryEffectiveDates = (entry) => {
    if (entry.recurrenceType === 'single') {
      return {
        start: entry.billingDate ? new Date(entry.billingDate + 'T00:00:00') : null,
        end: entry.billingDate ? new Date(entry.billingDate + 'T00:00:00') : null
      };
    } else if (entry.recurrenceType === 'semimonthly') {
      const startDates = semiMonthlyPeriodToDates(entry.startPeriod);
      const endDates = entry.isIndefinite ? 
        { start: null, end: new Date(2099, 11, 31) } : 
        semiMonthlyPeriodToDates(entry.endPeriod);
      
      return {
        start: startDates.start,
        end: entry.isIndefinite ? endDates.end : endDates.end
      };
    } else {
      return {
        start: entry.startDate ? new Date(entry.startDate + 'T00:00:00') : null,
        end: entry.isIndefinite ? new Date(2099, 11, 31) : (entry.endDate ? new Date(entry.endDate + 'T00:00:00') : null)
      };
    }
  };

  const getEntryOccurrenceCount = (entry, periodStart, periodEnd) => {
    const effectiveDates = getEntryEffectiveDates(entry);
    const entryStart = effectiveDates.start;
    const entryEnd = effectiveDates.end;
    
    if (!entryStart || !entryEnd || entryEnd < periodStart || entryStart > periodEnd) {
      return 0;
    }
    
    let count = 0;
    
    if (entry.recurrenceType === 'single') {
      const billingDate = new Date(entry.billingDate + 'T00:00:00');
      if (billingDate >= periodStart && billingDate <= periodEnd) {
        count = 1;
      }
    } else if (entry.recurrenceType === 'monthly') {
      // For monthly entries, calculate the actual recurring date each month
      let currentMonth = new Date((entryStart > periodStart ? entryStart : periodStart).getTime());
      currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      
      while (currentMonth <= (entryEnd < periodEnd ? entryEnd : periodEnd)) {
        // Calculate the actual occurrence date for this month based on the start date
        const recurringDayOfMonth = entryStart.getDate();
        const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
        const actualDay = Math.min(recurringDayOfMonth, lastDayOfMonth); // Handle months with fewer days
        
        const monthlyOccurrence = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), actualDay);
        
        // Check if this monthly occurrence falls within the query period
        if (monthlyOccurrence >= periodStart && monthlyOccurrence <= periodEnd && 
            monthlyOccurrence >= entryStart && monthlyOccurrence <= entryEnd) {
          count++;
        }
        
        currentMonth.setMonth(currentMonth.getMonth() + 1);
      }
    } else if (entry.recurrenceType === 'semimonthly') {
      let currentMonth = new Date((entryStart > periodStart ? entryStart : periodStart).getTime());
      currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      
      while (currentMonth <= (entryEnd < periodEnd ? entryEnd : periodEnd)) {
        const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        
        if (monthStart <= periodEnd && monthEnd >= periodStart) {
          const firstOccurrence = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
          if (firstOccurrence >= (entryStart > periodStart ? entryStart : periodStart) && 
              firstOccurrence <= (entryEnd < periodEnd ? entryEnd : periodEnd)) {
            count++;
          }
          
          const sixteenthOccurrence = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 16);
          if (sixteenthOccurrence >= (entryStart > periodStart ? entryStart : periodStart) && 
              sixteenthOccurrence <= (entryEnd < periodEnd ? entryEnd : periodEnd)) {
            count++;
          }
        }
        
        currentMonth.setMonth(currentMonth.getMonth() + 1);
      }
    } else {
      // Bi-weekly entries: calculate from the actual start date
      let currentOccurrence = new Date(entryStart);
      
      while (currentOccurrence <= (entryEnd < periodEnd ? entryEnd : periodEnd)) {
        // Check if this bi-weekly occurrence falls within the query period
        if (currentOccurrence >= periodStart && currentOccurrence <= periodEnd) {
          count++;
        }
        
        // Move to next bi-weekly occurrence (add 14 days)
        currentOccurrence = new Date(currentOccurrence);
        currentOccurrence.setDate(currentOccurrence.getDate() + 14);
      }
    }
    
    return count;
  };

  const isEntryActiveForPeriod = (entry, periodStart, periodEnd) => {
    return getEntryOccurrenceCount(entry, periodStart, periodEnd) > 0;
  };

  const getCurrentPeriod = () => {
    const today = new Date();
    const offsetDate = new Date(today);
    
    // Apply offset to get different periods
    if (periodType === 'monthly') {
      offsetDate.setMonth(today.getMonth() + currentPeriodOffset);
    } else {
      // For semi-monthly, offset by half-month periods
      const totalSemiMonthlyOffset = currentPeriodOffset;
      const monthOffset = Math.floor(totalSemiMonthlyOffset / 2);
      const halfMonthOffset = totalSemiMonthlyOffset % 2;
      
      // Start with current month + month offset
      offsetDate.setMonth(today.getMonth() + monthOffset);
      
      // Determine which half of the month we're currently in
      const isCurrentlySecondHalf = today.getDate() > 15;
      
      if (halfMonthOffset === 0) {
        // Stay in same half-month relative to current
        if (isCurrentlySecondHalf) {
          offsetDate.setDate(20); // Second half
        } else {
          offsetDate.setDate(8); // First half
        }
      } else {
        // Switch to other half-month
        if (isCurrentlySecondHalf) {
          // Currently in second half, switch to first half of next month
          offsetDate.setMonth(offsetDate.getMonth() + 1);
          offsetDate.setDate(8);
        } else {
          // Currently in first half, switch to second half of same month
          offsetDate.setDate(20);
        }
      }
    }
    
    const dateToUse = offsetDate;
    
    if (periodType === 'monthly') {
      const year = dateToUse.getFullYear();
      const month = dateToUse.getMonth();
      const periodStart = new Date(year, month, 1);
      const periodEnd = new Date(year, month + 1, 0);
      return { 
        start: periodStart, 
        end: periodEnd, 
        period: `${periodStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
        periodNumber: month + 1
      };
    } else {
      const year = dateToUse.getFullYear();
      const month = dateToUse.getMonth();
      const dayOfMonth = dateToUse.getDate();
      
      if (dayOfMonth <= 15) {
        const periodStart = new Date(year, month, 1);
        const periodEnd = new Date(year, month, 15);
        return {
          start: periodStart,
          end: periodEnd,
          period: `${periodStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} - First Cutoff`,
          periodNumber: (month * 2) + 1
        };
      } else {
        const periodStart = new Date(year, month, 16);
        const periodEnd = new Date(year, month + 1, 0);
        return {
          start: periodStart,
          end: periodEnd,
          period: `${periodStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} - Second Cutoff`,
          periodNumber: (month * 2) + 2
        };
      }
    }
  };

  const getPeriodWithOffset = (offset) => {
    const today = new Date();
    
    if (periodType === 'monthly') {
      const targetDate = new Date(today.getFullYear(), today.getMonth() + offset, 1);
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth();
      const periodStart = new Date(year, month, 1);
      const periodEnd = new Date(year, month + 1, 0);
      return { 
        start: periodStart, 
        end: periodEnd, 
        period: `${periodStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
        periodNumber: month + 1
      };
    } else {
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();
      const currentDay = today.getDate();
      
      let currentSemiMonthlyPeriod = currentMonth * 2;
      if (currentDay > 15) {
        currentSemiMonthlyPeriod += 1;
      }
      
      const targetPeriod = currentSemiMonthlyPeriod + offset;
      const targetMonth = Math.floor(targetPeriod / 2);
      const isSecondHalf = targetPeriod % 2 === 1;
      
      const targetDate = new Date(currentYear, targetMonth, 1);
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth();
      
      if (isSecondHalf) {
        const periodStart = new Date(year, month, 16);
        const periodEnd = new Date(year, month + 1, 0);
        return {
          start: periodStart,
          end: periodEnd,
          period: `${periodStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} - Second Cutoff`,
          periodNumber: (month * 2) + 2
        };
      } else {
        const periodStart = new Date(year, month, 1);
        const periodEnd = new Date(year, month, 15);
        return {
          start: periodStart,
          end: periodEnd,
          period: `${periodStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} - First Cutoff`,
          periodNumber: (month * 2) + 1
        };
      }
    }
  };

  const getPeriodKey = (period) => {
    return `${period.start.toISOString()}_${period.end.toISOString()}`;
  };

  const isEntryCheckedForPeriod = (entryId, period) => {
    const periodKey = getPeriodKey(period);
    return timelineCheckedEntries[periodKey]?.[entryId] !== false; // Default to checked
  };

  const toggleEntryForPeriod = (entryId, period) => {
    const periodKey = getPeriodKey(period);
    const currentState = timelineCheckedEntries[periodKey]?.[entryId] !== false;
    
    const updatedCheckedEntries = {
      ...timelineCheckedEntries,
      [periodKey]: {
        ...timelineCheckedEntries[periodKey],
        [entryId]: !currentState
      }
    };
    
    setTimelineCheckedEntries(updatedCheckedEntries);
    
    // Auto-save checkbox state changes
    setTimeout(() => {
      autoSave(entries, periodType, updatedCheckedEntries);
    }, 100);
  };

  const handleSort = (sortType) => {
    if (entrySortBy === sortType) {
      // Toggle sort order if same type is clicked
      setEntrySortOrder(entrySortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort type with ascending order
      setEntrySortBy(sortType);
      setEntrySortOrder('asc');
    }
  };

  const getFilteredAndSortedEntries = () => {
    // First filter by search query
    let filteredEntries = entries.filter(entry => {
      if (!searchQuery) return true;
      
      const query = searchQuery.toLowerCase();
      const categoryInfo = getCategoryInfo(entry.type, entry.category);
      
      return (
        entry.label.toLowerCase().includes(query) ||
        entry.type.toLowerCase().includes(query) ||
        entry.recurrenceType.toLowerCase().includes(query) ||
        categoryInfo.label.toLowerCase().includes(query) ||
        entry.amount.toString().includes(query)
      );
    });
    
    // Then sort the filtered results
    const sortedEntries = [...filteredEntries].sort((a, b) => {
      let comparison = 0;
      
      switch (entrySortBy) {
        case 'alphabetical':
          comparison = a.label.localeCompare(b.label);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'category':
          const aCategoryInfo = getCategoryInfo(a.type, a.category);
          const bCategoryInfo = getCategoryInfo(b.type, b.category);
          comparison = aCategoryInfo.label.localeCompare(bCategoryInfo.label);
          break;
        case 'recurrence':
          comparison = a.recurrenceType.localeCompare(b.recurrenceType);
          break;
        case 'active':
          const aActive = isEntryActive(a);
          const bActive = isEntryActive(b);
          if (aActive && !bActive) comparison = -1;
          else if (!aActive && bActive) comparison = 1;
          else comparison = 0;
          break;
        default:
          comparison = 0;
      }
      
      return entrySortOrder === 'asc' ? comparison : -comparison;
    });
    
    return sortedEntries;
  };

  const getFilteredAndSortedSinglePeriodEntries = () => {
    const filteredActiveEntries = activeEntries.filter(entry => {
      // Search filter
      const searchLower = singlePeriodSearchQuery.toLowerCase();
      const matchesSearch = !singlePeriodSearchQuery || 
        entry.label.toLowerCase().includes(searchLower) ||
        (entry.category && getCategoryInfo(entry.type, entry.category).label.toLowerCase().includes(searchLower));
      
      return matchesSearch;
    });

    // Sort entries
    const sortedEntries = [...filteredActiveEntries].sort((a, b) => {
      const getSortValue = (entry, sortType) => {
        switch (sortType) {
          case 'alphabetical':
            return entry.label.toLowerCase();
          case 'type':
            return entry.type === 'income' ? 0 : 1;
          case 'recurrence':
            const recurrenceOrder = { single: 0, monthly: 1, semimonthly: 2, biweekly: 3 };
            return recurrenceOrder[entry.recurrenceType] || 999;
          case 'category':
            if (!entry.category) return 'zzz';
            return getCategoryInfo(entry.type, entry.category).label.toLowerCase();
          case 'checked':
            return isEntryCheckedForPeriod(entry.id, currentPeriod) ? 0 : 1;
          case 'amount':
            return entry.amount || 0;
          default:
            return entry.label.toLowerCase();
        }
      };

      const aValue = getSortValue(a, singlePeriodSortBy);
      const bValue = getSortValue(b, singlePeriodSortBy);
      
      if (singlePeriodSortBy === 'amount') {
        return bValue - aValue; // Descending for amount (highest first)
      }
      
      if (aValue < bValue) return -1;
      if (aValue > bValue) return 1;
      return 0;
    });

    return sortedEntries;
  };

  const generateTimelinePeriods = () => {
    const periods = [];
    for (let i = timelineStart; i < timelineStart + 6; i++) {
      const period = getPeriodWithOffset(i);
      const activeEntries = entries.filter(entry => 
        isEntryActiveForPeriod(entry, period.start, period.end)
      );
      
      const totalIncome = activeEntries
        .filter(entry => entry.type === 'income' && isEntryCheckedForPeriod(entry.id, period))
        .reduce((sum, entry) => {
          const occurrences = getEntryOccurrenceCount(entry, period.start, period.end);
          return sum + (entry.amount * occurrences);
        }, 0);
      
      const totalExpenses = activeEntries
        .filter(entry => entry.type === 'expense' && isEntryCheckedForPeriod(entry.id, period))
        .reduce((sum, entry) => {
          const occurrences = getEntryOccurrenceCount(entry, period.start, period.end);
          return sum + (entry.amount * occurrences);
        }, 0);
      
      periods.push({
        ...period,
        activeEntries,
        totalIncome,
        totalExpenses,
        netAmount: totalIncome - totalExpenses,
        isCurrent: i === 0
      });
    }
    return periods;
  };

  const generateCalendarPeriods = (numberOfPeriods = 12) => {
    const periods = [];
    const startOffset = -2; // Start 2 periods before current
    
    for (let i = startOffset; i < startOffset + numberOfPeriods; i++) {
      const period = getPeriodWithOffset(i);
      const activeEntries = entries.filter(entry => 
        isEntryActiveForPeriod(entry, period.start, period.end)
      );
      
      // Get entries with their occurrence details for this period
      const periodEntries = activeEntries.map(entry => {
        const occurrences = getEntryOccurrenceCount(entry, period.start, period.end);
        const isChecked = isEntryCheckedForPeriod(entry.id, period);
        return {
          ...entry,
          occurrences,
          totalAmount: entry.amount * occurrences,
          isChecked
        };
      });
      
      const totalIncome = periodEntries
        .filter(entry => entry.type === 'income' && entry.isChecked)
        .reduce((sum, entry) => sum + entry.totalAmount, 0);
      
      const totalExpenses = periodEntries
        .filter(entry => entry.type === 'expense' && entry.isChecked)
        .reduce((sum, entry) => sum + entry.totalAmount, 0);
      
      periods.push({
        ...period,
        entries: periodEntries,
        totalIncome,
        totalExpenses,
        netAmount: totalIncome - totalExpenses,
        isCurrent: i === 0
      });
    }
    return periods;
  };

  const currentPeriod = getCurrentPeriod();

  // Adjustment functions for variable recurring entries
  const getEntryAdjustment = (entryId, period) => {
    const entry = entries.find(e => e.id === entryId);
    if (!entry || !entry.adjustments || !period || !period.start) return 0;
    const periodKey = getPeriodKey(period);
    return entry.adjustments[periodKey] || 0;
  };

  const getAdjustedAmount = (entry, period) => {
    if (!entry || !period) return entry?.amount || 0;
    const baseAmount = entry.amount || 0;
    const adjustment = getEntryAdjustment(entry.id, period);
    return baseAmount + adjustment;
  };

  const openAdjustmentModal = (entry, period) => {
    const currentAdjustment = getEntryAdjustment(entry.id, period);
    setAdjustmentModal({ entry, period });
    setAdjustmentAmount(currentAdjustment.toString());
    setAdjustmentNote('');
  };

  const saveAdjustment = async () => {
    if (!adjustmentModal) return;
    
    const { entry, period } = adjustmentModal;
    const adjustment = parseFloat(adjustmentAmount) || 0;
    const periodKey = getPeriodKey(period);
    
    const updatedEntries = entries.map(e => {
      if (e.id === entry.id) {
        const updatedEntry = { ...e };
        if (!updatedEntry.adjustments) {
          updatedEntry.adjustments = {};
        }
        
        if (adjustment === 0) {
          // Remove adjustment if it's zero
          delete updatedEntry.adjustments[periodKey];
          if (Object.keys(updatedEntry.adjustments).length === 0) {
            delete updatedEntry.adjustments;
          }
        } else {
          updatedEntry.adjustments[periodKey] = adjustment;
        }
        
        return updatedEntry;
      }
      return e;
    });
    
    setEntries(updatedEntries);
    await saveDataToServer(updatedEntries, periodType);
    setAdjustmentModal(null);
    setAdjustmentAmount('');
    setAdjustmentNote('');
  };

  const isEntryActive = (entry) => {
    return isEntryActiveForPeriod(entry, currentPeriod.start, currentPeriod.end);
  };

  const addEntry = () => {
    if (!newEntry.label || !newEntry.amount) {
      alert('Please fill in label and amount');
      return;
    }

    if (newEntry.recurrenceType === 'single') {
      if (!newEntry.billingDate) {
        alert('Please select a billing date');
        return;
      }
    } else if (newEntry.recurrenceType === 'semimonthly') {
      if (!newEntry.startPeriod) {
        alert('Please select a start period');
        return;
      }
      if (!newEntry.isIndefinite && !newEntry.endPeriod) {
        alert('Please select an end period or mark as indefinite');
        return;
      }
    } else {
      if (!newEntry.startDate) {
        alert('Please set a start date');
        return;
      }
      if (!newEntry.isIndefinite && !newEntry.endDate) {
        alert('Please set an end date or mark as indefinite');
        return;
      }
    }

    const entry = {
      id: Date.now(),
      ...newEntry,
      amount: parseFloat(newEntry.amount)
    };

    const updatedEntries = [...entries, entry];
    setEntries(updatedEntries);
    
    // Auto-save after adding entry
    setTimeout(() => {
      autoSave(updatedEntries, periodType);
    }, 100);
    
    setNewEntry({
      label: '',
      amount: '',
      type: 'income',
      recurrenceType: 'biweekly',
      startDate: '',
      endDate: '',
      startPeriod: '',
      endPeriod: '',
      billingDate: '',
      isIndefinite: false
    });
  };

  const startEditing = (entry) => {
    setEditingEntry({...entry});
  };

  const saveEdit = () => {
    if (!editingEntry.label || !editingEntry.amount) {
      alert('Please fill in label and amount');
      return;
    }

    if (editingEntry.recurrenceType === 'single') {
      if (!editingEntry.billingDate) {
        alert('Please select a billing date');
        return;
      }
    } else if (editingEntry.recurrenceType === 'semimonthly') {
      if (!editingEntry.startPeriod) {
        alert('Please select a start period');
        return;
      }
      if (!editingEntry.isIndefinite && !editingEntry.endPeriod) {
        alert('Please select an end period or mark as indefinite');
        return;
      }
    } else {
      if (!editingEntry.startDate) {
        alert('Please set a start date');
        return;
      }
      if (!editingEntry.isIndefinite && !editingEntry.endDate) {
        alert('Please set an end date or mark as indefinite');
        return;
      }
    }

    const updatedEntries = entries.map(entry => 
      entry.id === editingEntry.id 
        ? {...editingEntry, amount: parseFloat(editingEntry.amount)}
        : entry
    );
    setEntries(updatedEntries);
    setEditingEntry(null);
    
    // Auto-save after editing entry
    setTimeout(() => {
      autoSave(updatedEntries, periodType);
    }, 100);
  };

  const cancelEdit = () => {
    setEditingEntry(null);
  };

  const autoSave = async (entriesToSave, periodTypeToSave, checkedEntriesToSave = timelineCheckedEntries) => {
    const dataToSave = {
      entries: entriesToSave,
      periodType: periodTypeToSave,
      timelineCheckedEntries: checkedEntriesToSave
    };
    
    try {
      const apiUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:3001/api/budget'
        : `http://${window.location.hostname}:3001/api/budget`;
      await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave),
      });
      // Silent auto-save, no alert
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const removeEntry = (id) => {
    const updatedEntries = entries.filter(entry => entry.id !== id);
    setEntries(updatedEntries);
    
    // Auto-save after removing entry
    setTimeout(() => {
      autoSave(updatedEntries, periodType);
    }, 100);
  };

  const saveData = async () => {
    setIsSaving(true);
    const dataToSave = {
      entries: entries,
      periodType: periodType,
      timelineCheckedEntries: timelineCheckedEntries
    };
    
    try {
      const apiUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:3001/api/budget'
        : `http://${window.location.hostname}:3001/api/budget`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave),
      });
      
      if (response.ok) {
        const result = await response.json();
        alert('Data saved successfully to shared storage!');
        // Also save to localStorage as backup
        localStorage.setItem('budgetTrackerData', JSON.stringify({
          ...dataToSave,
          lastSaved: new Date().toISOString(),
          version: '1.0'
        }));
      } else {
        throw new Error('Server responded with error');
      }
    } catch (error) {
      console.error('Error saving data to server:', error);
      // Fallback to localStorage
      try {
        localStorage.setItem('budgetTrackerData', JSON.stringify({
          ...dataToSave,
          lastSaved: new Date().toISOString(),
          version: '1.0'
        }));
        alert('Data saved locally (server unavailable)');
      } catch (localError) {
        console.error('Error saving data locally:', localError);
        alert('Error saving data. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const exportData = () => {
    const exportData = {
      entries: entries,
      periodType: periodType,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `budget-tracker-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Start loading state
    setIsImporting(true);

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        // Parse JSON data
        const importedData = JSON.parse(e.target.result);
        
        if (importedData.entries && Array.isArray(importedData.entries)) {
          // Validate entries
          const validEntries = importedData.entries.filter(entry => 
            entry.label && 
            entry.amount !== undefined && 
            entry.type && 
            entry.recurrenceType
          );
          
          if (validEntries.length === 0) {
            alert('Import completed: No valid entries found in the imported file. Please check the file format.');
            setIsImporting(false);
            return;
          }
          
          const confirmImport = window.confirm(
            `Import Progress: Successfully parsed ${validEntries.length} valid entries from the file.\n\nThis will replace your current data. Continue with import?`
          );
          
          if (confirmImport) {
            // Apply imported data
            setEntries(validEntries);
            if (importedData.periodType) {
              setPeriodType(importedData.periodType);
            }
            alert(`Import completed successfully!\n\n✓ Imported ${validEntries.length} entries\n${importedData.periodType ? '✓ Updated period type\n' : ''}✓ Data is now available in your budget tracker`);
          }
        } else {
          alert('Import failed: Invalid file format detected.\n\nPlease select a valid budget tracker export file (.json format).');
        }
      } catch (error) {
        console.error('Import error:', error);
        alert('Import failed: Error parsing the file.\n\nPlease ensure it\'s a valid JSON file and try again.');
      } finally {
        // Always stop loading state
        setIsImporting(false);
      }
    };
    
    reader.onerror = () => {
      alert('Import failed: Error reading the file.\n\nPlease check the file and try again.');
      setIsImporting(false);
    };
    
    reader.readAsText(file);
    event.target.value = '';
  };

  const triggerImport = () => {
    fileInputRef.current?.click();
  };

  const activeEntries = entries.filter(isEntryActive);
  const totalIncome = activeEntries
    .filter(entry => entry.type === 'income' && isEntryCheckedForPeriod(entry.id, currentPeriod))
    .reduce((sum, entry) => {
      const occurrences = getEntryOccurrenceCount(entry, currentPeriod.start, currentPeriod.end);
      const adjustedAmount = getAdjustedAmount(entry, currentPeriod);
      return sum + (adjustedAmount * occurrences);
    }, 0);
  
  const totalExpenses = activeEntries
    .filter(entry => entry.type === 'expense' && isEntryCheckedForPeriod(entry.id, currentPeriod))
    .reduce((sum, entry) => {
      const occurrences = getEntryOccurrenceCount(entry, currentPeriod.start, currentPeriod.end);
      const adjustedAmount = getAdjustedAmount(entry, currentPeriod);
      return sum + (adjustedAmount * occurrences);
    }, 0);
  
  const netAmount = totalIncome - totalExpenses;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getCategoryInfo = (type, category) => {
    if (!category) return { label: '❓ Uncategorized', color: 'bg-gray-400' };
    
    const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    return categories[category] || { label: '❓ Uncategorized', color: 'bg-gray-400' };
  };

  const getAvailableCategories = (type) => {
    return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  };

  const calculateRunningTotals = () => {
    const amount = parseFloat(newEntry.amount) || 0;
    if (amount === 0) return { income: 0, expense: 0, net: 0 };
    
    if (newEntry.type === 'income') {
      return {
        income: amount,
        expense: 0,
        net: amount
      };
    } else {
      return {
        income: 0,
        expense: amount,
        net: -amount
      };
    }
  };

  const getCategoryBreakdown = () => {
    const breakdown = {};
    let totalExpenses = 0;
    
    activeEntries
      .filter(entry => entry.type === 'expense' && isEntryCheckedForPeriod(entry.id, currentPeriod))
      .forEach(entry => {
        const occurrences = getEntryOccurrenceCount(entry, currentPeriod.start, currentPeriod.end);
        const amount = entry.amount * occurrences;
        const categoryKey = entry.category || 'uncategorized';
        const categoryInfo = getCategoryInfo('expense', entry.category);
        
        if (!breakdown[categoryKey]) {
          breakdown[categoryKey] = {
            label: categoryInfo.label,
            color: categoryInfo.color,
            amount: 0
          };
        }
        breakdown[categoryKey].amount += amount;
        totalExpenses += amount;
      });
    
    // Calculate percentages
    Object.keys(breakdown).forEach(key => {
      breakdown[key].percentage = totalExpenses > 0 ? (breakdown[key].amount / totalExpenses) * 100 : 0;
    });
    
    return { breakdown, totalExpenses };
  };

  return (
    <>
      <style jsx>{`
        @keyframes pulse-gentle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        .animate-pulse-gentle {
          animation: pulse-gentle 3s ease-in-out infinite;
        }
      `}</style>
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className={`rounded-xl p-6 flex items-center space-x-3 ${
            isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
          }`}>
            <Loader2 className="animate-spin" size={24} />
            <span className="font-medium">Loading your budget data...</span>
          </div>
        </div>
      )}
      <div className={`min-h-screen transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800' 
          : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
      }`}>
      <div className="w-[95%] max-w-none mx-auto p-6">
        <div className="mb-8">
          <div className={`rounded-2xl p-8 shadow-lg border transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-gray-800/80 backdrop-blur-sm border-gray-700/50' 
              : 'bg-white/80 backdrop-blur-sm border-white/20'
          }`}>
            <div className="text-center relative">
              <div className="absolute top-0 right-0 flex items-center space-x-2">
                {/* Auto-save indicator */}
                <div className={`flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                  autoSaveStatus === 'saving' 
                    ? isDarkMode ? 'bg-blue-800/50 text-blue-300' : 'bg-blue-100 text-blue-700'
                    : autoSaveStatus === 'saved'
                    ? isDarkMode ? 'bg-green-800/50 text-green-300' : 'bg-green-100 text-green-700'
                    : autoSaveStatus === 'error'
                    ? isDarkMode ? 'bg-red-800/50 text-red-300' : 'bg-red-100 text-red-700'
                    : 'opacity-0'
                }`}>
                  {autoSaveStatus === 'saving' && (
                    <>
                      <Loader2 className="animate-spin mr-1" size={14} />
                      Saving...
                    </>
                  )}
                  {autoSaveStatus === 'saved' && (
                    <>
                      <Check className="mr-1" size={14} />
                      Saved
                    </>
                  )}
                  {autoSaveStatus === 'error' && (
                    <>
                      <WifiOff className="mr-1" size={14} />
                      Offline
                    </>
                  )}
                </div>
                
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`p-3 rounded-xl transition-all duration-200 flex items-center justify-center ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600' 
                      : 'bg-slate-100 hover:bg-slate-200'
                  }`}
                  title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDarkMode ? <Sun size={24} className="text-amber-500" /> : <Moon size={24} className="text-slate-600" />}
                </button>
              </div>
              <h1 className={`text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent mb-2 ${
                isDarkMode 
                  ? 'from-white to-gray-300' 
                  : 'from-slate-800 to-slate-600'
              }`}>Budget Tracker</h1>
              <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-slate-600'}`}>Track your income and expenses with precision</p>
            </div>
          </div>
        
          <br />
          
          <div className="flex justify-center space-x-3 mb-6">
            <button
              onClick={saveData}
              disabled={isSaving}
              className={`px-6 py-3 bg-gradient-to-r text-white rounded-xl transition-all duration-200 flex items-center font-medium shadow-lg ${
                isSaving 
                  ? 'from-gray-400 to-gray-500 cursor-not-allowed shadow-gray-400/25' 
                  : 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-blue-500/25'
              }`}
            >
              {isSaving ? (
                <Loader2 className="mr-2 animate-spin" size={18} />
              ) : (
                <Database className="mr-2" size={18} />
              )}
              {isSaving ? 'Saving...' : 'Save Data'}
            </button>
            <button
              onClick={exportData}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 flex items-center font-medium shadow-lg shadow-emerald-500/25"
            >
              <Download className="mr-2" size={18} />
              Export Data
            </button>
            <button
              onClick={triggerImport}
              disabled={isImporting}
              className={`px-6 py-3 bg-gradient-to-r text-white rounded-xl transition-all duration-200 flex items-center font-medium shadow-lg ${
                isImporting 
                  ? 'from-gray-500 to-gray-600 cursor-not-allowed shadow-gray-500/25' 
                  : 'from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-purple-500/25'
              }`}
            >
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={18} />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="mr-2" size={18} />
                  Import Data
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={importData}
              className="hidden"
            />
          </div>

          <div className={`rounded-2xl p-6 shadow-lg border transition-colors duration-300 mb-6 ${
            isDarkMode 
              ? 'bg-gray-800/80 backdrop-blur-sm border-gray-700/50' 
              : 'bg-white/80 backdrop-blur-sm border-white/20'
          }`}>
            <h2 className={`text-center text-lg font-semibold mb-6 ${
              isDarkMode ? 'text-gray-300' : 'text-slate-700'
            }`}>Budget Period View</h2>
            <div className="flex justify-center space-x-4 mb-6">
              <label className={`flex items-center p-3 rounded-lg transition-colors cursor-pointer ${
                isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-slate-50'
              }`}>
                <input
                  type="radio"
                  value="semimonthly"
                  checked={periodType === 'semimonthly'}
                  onChange={(e) => setPeriodType(e.target.value)}
                  className="mr-3 w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 focus:ring-2"
                />
                <CalendarRange className={`mr-2 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`} size={18} />
                <span className={`font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-slate-700'
                }`}>Semi-monthly (First & Second Cutoff)</span>
              </label>
              <label className={`flex items-center p-3 rounded-lg transition-colors cursor-pointer ${
                isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-slate-50'
              }`}>
                <input
                  type="radio"
                  value="monthly"
                  checked={periodType === 'monthly'}
                  onChange={(e) => setPeriodType(e.target.value)}
                  className="mr-3 w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 focus:ring-2"
                />
                <CalendarCheck className={`mr-2 ${
                  isDarkMode ? 'text-green-400' : 'text-green-600'
                }`} size={18} />
                <span className={`font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-slate-700'
                }`}>Monthly (Full month)</span>
              </label>
            </div>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setCurrentView('current')}
                className={`px-6 py-3 rounded-xl flex items-center font-medium transition-all duration-200 ${
                  currentView === 'current' 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25' 
                    : isDarkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:shadow-md' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:shadow-md'
                }`}
              >
                <Calendar className="mr-2" size={18} />
                Single Period
              </button>
              <button
                onClick={() => setCurrentView('timeline')}
                className={`px-6 py-3 rounded-xl flex items-center font-medium transition-all duration-200 ${
                  currentView === 'timeline' 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25' 
                    : isDarkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:shadow-md' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:shadow-md'
                }`}
              >
                <BarChart3 className="mr-2" size={18} />
                Timeline View
              </button>
              <button
                onClick={() => setCurrentView('calendar')}
                className={`px-6 py-3 rounded-xl flex items-center font-medium transition-all duration-200 ${
                  currentView === 'calendar' 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25' 
                    : isDarkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:shadow-md' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:shadow-md'
                }`}
              >
                <CalendarDays className="mr-2" size={18} />
                Calendar View
              </button>
            </div>
          </div>
        </div>

          {currentView === 'current' && (
            <div className={`relative p-6 rounded-2xl border-2 shadow-lg transition-all duration-300 overflow-hidden ${
              isDarkMode 
                ? 'bg-gradient-to-r from-blue-900/80 to-indigo-900/80 border-blue-400/50 shadow-blue-500/20' 
                : 'bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-300/50 shadow-blue-500/20'
            } animate-pulse-gentle`}>
              <div className={`absolute inset-0 bg-gradient-to-r opacity-10 ${
                isDarkMode ? 'from-blue-400/20 to-indigo-400/20' : 'from-blue-600/20 to-indigo-600/20'
              }`}></div>
              <div className="relative z-10 flex items-center justify-between">
                {/* Left Arrow */}
                <button
                  onClick={() => setCurrentPeriodOffset(currentPeriodOffset - 1)}
                  className={`p-3 rounded-xl transition-all duration-200 hover:scale-110 ${
                    isDarkMode 
                      ? 'bg-blue-800/50 hover:bg-blue-700/70 text-blue-300' 
                      : 'bg-blue-200/50 hover:bg-blue-300/70 text-blue-700'
                  }`}
                >
                  <ChevronLeft size={24} />
                </button>

                {/* Center Content */}
                <div className="flex items-center">
                  <div className={`p-3 rounded-xl mr-4 ${
                    isDarkMode ? 'bg-blue-800/50' : 'bg-blue-200/50'
                  }`}>
                    <Calendar className={`${
                      isDarkMode ? 'text-blue-300' : 'text-blue-700'
                    }`} size={24} />
                  </div>
                  <div className="text-center">
                    <p className={`font-bold text-xl ${
                      isDarkMode ? 'text-blue-200' : 'text-blue-900'
                    }`}>
                      {currentPeriodOffset === 0 ? 'Current' : currentPeriodOffset > 0 ? 'Future' : 'Past'} {periodType === 'monthly' ? 'Month' : 'Semi-Monthly Period'}
                    </p>
                    <p className={`text-lg font-medium ${
                      isDarkMode ? 'text-blue-300' : 'text-blue-800'
                    }`}>
                      {currentPeriod.start.toLocaleDateString()} - {currentPeriod.end.toLocaleDateString()}
                    </p>
                    <p className={`text-sm mt-1 ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}>{currentPeriod.period}</p>
                  </div>
                </div>

                {/* Right Arrow */}
                <button
                  onClick={() => setCurrentPeriodOffset(currentPeriodOffset + 1)}
                  className={`p-3 rounded-xl transition-all duration-200 hover:scale-110 ${
                    isDarkMode 
                      ? 'bg-blue-800/50 hover:bg-blue-700/70 text-blue-300' 
                      : 'bg-blue-200/50 hover:bg-blue-300/70 text-blue-700'
                  }`}
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>
          )}

        <br />

        {currentView === 'current' ? (
          <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className={`p-6 rounded-2xl border shadow-lg transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-gray-800/80 backdrop-blur-sm border-gray-700/50' 
                : 'bg-white/80 backdrop-blur-sm border-white/20'
            }`}>
              <div className="flex items-center mb-3">
                <div className={`p-2 rounded-xl ${
                  isDarkMode ? 'bg-emerald-900/50' : 'bg-emerald-100'
                }`}>
                  <DollarSign className="text-emerald-600" size={24} />
                </div>
                <h3 className={`font-semibold ml-3 ${
                  isDarkMode ? 'text-gray-200' : 'text-slate-800'
                }`}>Total Income</h3>
              </div>
              <p className="text-3xl font-bold text-emerald-600">{formatCurrency(totalIncome)}</p>
            </div>
            
            <div className={`p-6 rounded-2xl border shadow-lg transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-gray-800/80 backdrop-blur-sm border-gray-700/50' 
                : 'bg-white/80 backdrop-blur-sm border-white/20'
            }`}>
              <div className="flex items-center mb-3">
                <div className={`p-2 rounded-xl ${
                  isDarkMode ? 'bg-red-900/50' : 'bg-red-100'
                }`}>
                  <DollarSign className="text-red-600" size={24} />
                </div>
                <h3 className={`font-semibold ml-3 ${
                  isDarkMode ? 'text-gray-200' : 'text-slate-800'
                }`}>Total Expenses</h3>
              </div>
              <p className="text-3xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
            </div>
            
            <div className={`p-6 rounded-2xl border shadow-lg transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-gray-800/80 backdrop-blur-sm border-gray-700/50' 
                : 'bg-white/80 backdrop-blur-sm border-white/20'
            } ${netAmount >= 0 ? '' : (isDarkMode ? 'ring-2 ring-orange-500/50' : 'ring-2 ring-orange-200')}`}>
              <div className="flex items-center mb-3">
                <div className={`p-2 rounded-xl ${netAmount >= 0 ? 
                  (isDarkMode ? 'bg-blue-900/50' : 'bg-blue-100') : 
                  (isDarkMode ? 'bg-orange-900/50' : 'bg-orange-100')
                }`}>
                  <DollarSign className={`${netAmount >= 0 ? 'text-blue-600' : 'text-orange-600'}`} size={24} />
                </div>
                <h3 className={`font-semibold ml-3 ${
                  isDarkMode ? 'text-gray-200' : 'text-slate-800'
                }`}>Net Amount</h3>
              </div>
              <p className={`text-3xl font-bold ${netAmount >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                {formatCurrency(netAmount)}
              </p>
            </div>
          </div>

          {/* Category Breakdown */}
          {(() => {
            const { breakdown, totalExpenses } = getCategoryBreakdown();
            const categories = Object.values(breakdown).sort((a, b) => b.amount - a.amount);
            
            return totalExpenses > 0 && (
              <div className={`rounded-2xl shadow-lg border p-6 mb-8 transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-gray-800/80 backdrop-blur-sm border-gray-700/50' 
                  : 'bg-white/80 backdrop-blur-sm border-white/20'
              }`}>
                <h3 className={`text-xl font-semibold mb-4 text-center ${
                  isDarkMode ? 'text-gray-200' : 'text-slate-800'
                }`}>Expense Breakdown</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Visual Chart */}
                  <div className="flex items-center justify-center">
                    <div className="relative w-40 h-40">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          fill="none"
                          stroke={isDarkMode ? '#374151' : '#e5e7eb'}
                          strokeWidth="20"
                        />
                        {(() => {
                          let currentAngle = 0;
                          return categories.map((category, index) => {
                            const angle = (category.percentage / 100) * 360;
                            const startAngle = currentAngle;
                            currentAngle += angle;
                            
                            const x1 = 80 + 70 * Math.cos((startAngle * Math.PI) / 180);
                            const y1 = 80 + 70 * Math.sin((startAngle * Math.PI) / 180);
                            const x2 = 80 + 70 * Math.cos(((startAngle + angle) * Math.PI) / 180);
                            const y2 = 80 + 70 * Math.sin(((startAngle + angle) * Math.PI) / 180);
                            
                            const largeArcFlag = angle > 180 ? 1 : 0;
                            
                            return (
                              <path
                                key={index}
                                d={`M 80 80 L ${x1} ${y1} A 70 70 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                                fill={category.color.replace('bg-', '').replace('-500', '') === 'blue' ? '#3b82f6' :
                                      category.color.replace('bg-', '').replace('-500', '') === 'red' ? '#ef4444' :
                                      category.color.replace('bg-', '').replace('-500', '') === 'green' ? '#22c55e' :
                                      category.color.replace('bg-', '').replace('-500', '') === 'yellow' ? '#eab308' :
                                      category.color.replace('bg-', '').replace('-500', '') === 'purple' ? '#a855f7' :
                                      category.color.replace('bg-', '').replace('-500', '') === 'pink' ? '#ec4899' :
                                      category.color.replace('bg-', '').replace('-500', '') === 'lime' ? '#84cc16' :
                                      category.color.replace('bg-', '').replace('-700', '') === 'amber' ? '#f59e0b' :
                                      category.color.replace('bg-', '').replace('-500', '') === 'indigo' ? '#6366f1' :
                                      category.color.replace('bg-', '').replace('-500', '') === 'rose' ? '#f43f5e' :
                                      category.color.replace('bg-', '').replace('-500', '') === 'cyan' ? '#06b6d4' :
                                      category.color.replace('bg-', '').replace('-500', '') === 'slate' ? '#64748b' :
                                      category.color.replace('bg-', '').replace('-500', '') === 'teal' ? '#14b8a6' :
                                      category.color.replace('bg-', '').replace('-500', '') === 'orange' ? '#f97316' :
                                      '#6b7280'}
                                className="hover:opacity-80 transition-opacity"
                              />
                            );
                          });
                        })()}
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className={`text-sm font-medium ${
                            isDarkMode ? 'text-gray-300' : 'text-slate-600'
                          }`}>Total</div>
                          <div className={`text-lg font-bold ${
                            isDarkMode ? 'text-white' : 'text-slate-800'
                          }`}>{formatCurrency(totalExpenses)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Legend */}
                  <div className="space-y-2">
                    {categories.map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-3 ${category.color}`}></div>
                          <span className={`text-sm ${
                            isDarkMode ? 'text-gray-300' : 'text-slate-700'
                          }`}>
                            {category.label.replace(/^.+?\s/, '')}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-semibold ${
                            isDarkMode ? 'text-white' : 'text-slate-800'
                          }`}>
                            {formatCurrency(category.amount)}
                          </div>
                          <div className={`text-xs ${
                            isDarkMode ? 'text-gray-400' : 'text-slate-500'
                          }`}>
                            {category.percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Single Period Entries Checklist */}
          <div className={`rounded-2xl shadow-lg border p-6 mb-8 transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-gray-800/80 backdrop-blur-sm border-gray-700/50' 
              : 'bg-white/80 backdrop-blur-sm border-white/20'
          }`}>
            <h3 className={`text-xl font-semibold mb-4 text-center ${
              isDarkMode ? 'text-gray-200' : 'text-slate-800'
            }`}>Single Period Entries</h3>
            
            {/* Search and Sort Controls */}
            <div className="mb-4 space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  isDarkMode ? 'text-gray-400' : 'text-slate-400'
                }`} size={18} />
                <input
                  type="text"
                  placeholder="Search entries..."
                  value={singlePeriodSearchQuery}
                  onChange={(e) => setSinglePeriodSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-700/50 border-gray-600 text-gray-200 placeholder-gray-400 focus:bg-gray-600/50' 
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-slate-50'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              
              {/* Sort Options */}
              <div className="flex flex-wrap gap-2 justify-center">
                <span className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-slate-600'
                }`}>Sort by:</span>
                {[
                  { key: 'alphabetical', label: 'A-Z' },
                  { key: 'type', label: 'Type' },
                  { key: 'category', label: 'Category' },
                  { key: 'recurrence', label: 'Recurrence' },
                  { key: 'checked', label: 'Checked' },
                  { key: 'amount', label: 'Amount' }
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setSinglePeriodSortBy(key)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                      singlePeriodSortBy === key
                        ? 'bg-blue-600 text-white shadow-lg'
                        : isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            
            {(() => {
              const filteredEntries = getFilteredAndSortedSinglePeriodEntries();
              return filteredEntries.length === 0 ? (
                <div className={`text-center py-8 ${
                  isDarkMode ? 'text-gray-400' : 'text-slate-500'
                }`}>
                  <Calendar className={`mx-auto mb-2 ${
                    isDarkMode ? 'text-gray-500' : 'text-slate-400'
                  }`} size={32} />
                  <p>{activeEntries.length === 0 ? 'No active entries for this period' : 'No entries match your search'}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredEntries.map(entry => {
                  const occurrences = getEntryOccurrenceCount(entry, currentPeriod.start, currentPeriod.end);
                  const adjustedAmount = getAdjustedAmount(entry, currentPeriod);
                  const totalAmount = adjustedAmount * occurrences;
                  const hasAdjustment = getEntryAdjustment(entry.id, currentPeriod) !== 0;
                  const isChecked = isEntryCheckedForPeriod(entry.id, currentPeriod);
                  
                  return (
                    <div 
                      key={entry.id} 
                      className={`group flex items-center p-3 rounded-lg border-l-4 transition-colors duration-300 ${
                        entry.type === 'income' 
                          ? (isDarkMode 
                              ? 'border-emerald-500 bg-emerald-900/30' 
                              : 'border-emerald-500 bg-emerald-50'
                            )
                          : (isDarkMode 
                              ? 'border-red-500 bg-red-900/30' 
                              : 'border-red-500 bg-red-50'
                            )
                      } ${!isChecked ? 'opacity-50' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleEntryForPeriod(entry.id, currentPeriod)}
                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 focus:ring-1 mr-4 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center min-w-0 flex-1">
                            <div className={`w-3 h-3 rounded-full mr-2 flex-shrink-0 ${getCategoryInfo(entry.type, entry.category).color}`}></div>
                            <span className={`font-medium truncate ${
                              isDarkMode ? 'text-gray-200' : 'text-slate-800'
                            }`}>
                              {entry.label}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`font-bold ${entry.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                              {hasAdjustment ? (
                                <span className="flex items-center space-x-1">
                                  <span className="text-xs opacity-70">{formatCurrency(entry.amount)}</span>
                                  <span className={`text-xs ${getEntryAdjustment(entry.id, currentPeriod) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ({getEntryAdjustment(entry.id, currentPeriod) > 0 ? '+' : ''}{formatCurrency(getEntryAdjustment(entry.id, currentPeriod))})
                                  </span>
                                  <span>= {formatCurrency(totalAmount)}</span>
                                </span>
                              ) : (
                                formatCurrency(totalAmount)
                              )}
                            </span>
                            {entry.recurrenceType !== 'single' && (
                              <button
                                onClick={() => openAdjustmentModal(entry, currentPeriod)}
                                className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all duration-200 ${
                                  hasAdjustment 
                                    ? 'bg-blue-100 text-blue-600' 
                                    : isDarkMode 
                                      ? 'hover:bg-gray-600 text-gray-400 hover:text-gray-200' 
                                      : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                                }`}
                                title="Adjust amount for this period"
                              >
                                <span className="text-xs font-bold">±</span>
                              </button>
                            )}
                          </div>
                        </div>
                        <div className={`flex items-center text-sm mt-1 ${
                          isDarkMode ? 'text-gray-400' : 'text-slate-500'
                        }`}>
                          <Clock size={14} className="mr-1" />
                          <span>
                            {entry.recurrenceType === 'single' ? 'One-time occurrence' :
                             entry.recurrenceType === 'monthly' ? 'Monthly' : 
                             entry.recurrenceType === 'semimonthly' ? 'Semi-monthly' : 
                             'Bi-weekly'}
                            {occurrences > 1 && ` (${occurrences}×)`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              );
            })()}
          </div>
          </>
        ) : currentView === 'timeline' ? (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-semibold ${
              isDarkMode ? 'text-gray-200' : 'text-slate-800'
            }`}>Timeline View</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setTimelineStart(timelineStart - 3)}
                className={`p-2 rounded-md transition-colors duration-200 ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setTimelineStart(0)}
                className={`px-3 py-1 rounded-md text-sm transition-colors duration-200 ${
                  isDarkMode 
                    ? 'bg-blue-900/50 text-blue-300 hover:bg-blue-800/50' 
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                Current
              </button>
              <button
                onClick={() => setTimelineStart(timelineStart + 3)}
                className={`p-2 rounded-md transition-colors duration-200 ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="flex space-x-4 pb-4" style={{minWidth: '1200px'}}>
              {generateTimelinePeriods().map((period, index) => (
                <div
                  key={index}
                  className={`flex-shrink-0 w-64 p-4 rounded-lg border transition-colors duration-300 ${
                    period.isCurrent 
                      ? (isDarkMode 
                          ? 'bg-blue-900/30 border-blue-600/50 ring-2 ring-blue-500/30' 
                          : 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
                        )
                      : (isDarkMode 
                          ? 'bg-gray-800/80 border-gray-700/50' 
                          : 'bg-white border-gray-200'
                        )
                  }`}
                >
                  <div className="mb-3">
                    <h3 className={`font-semibold ${
                      period.isCurrent 
                        ? (isDarkMode ? 'text-blue-300' : 'text-blue-800') 
                        : (isDarkMode ? 'text-gray-200' : 'text-gray-800')
                    }`}>
                      {period.period}
                    </h3>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {period.start.toLocaleDateString()} - {period.end.toLocaleDateString()}
                    </p>
                    {period.isCurrent && (
                      <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                        isDarkMode 
                          ? 'bg-blue-900/50 text-blue-300' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        Current
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-600">Income:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(period.totalIncome)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-600">Expenses:</span>
                      <span className="font-semibold text-red-600">
                        {formatCurrency(period.totalExpenses)}
                      </span>
                    </div>
                    <div className={`border-t pt-2 ${
                      isDarkMode ? 'border-gray-600' : 'border-gray-200'
                    }`}>
                      <div className="flex justify-between">
                        <span className={period.netAmount >= 0 ? 'text-blue-600' : 'text-orange-600'}>
                          Net:
                        </span>
                        <span className={`font-bold ${period.netAmount >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                          {formatCurrency(period.netAmount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {period.activeEntries.length > 0 && (
                    <div className={`mt-3 pt-3 border-t ${
                      isDarkMode ? 'border-gray-600' : 'border-gray-200'
                    }`}>
                      <p className={`text-xs mb-2 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {period.activeEntries.length} active entries
                      </p>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {period.activeEntries.map(entry => {
                          const occurrences = getEntryOccurrenceCount(entry, period.start, period.end);
                          const totalAmount = entry.amount * occurrences;
                          const isChecked = isEntryCheckedForPeriod(entry.id, period);
                          return (
                            <div key={entry.id} className={`text-xs flex items-center py-1 space-x-2 ${!isChecked ? 'opacity-50' : ''}`}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleEntryForPeriod(entry.id, period)}
                                className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-1 flex-shrink-0"
                              />
                              <div className="flex items-center min-w-0 flex-1">
                                <div className={`w-2 h-2 rounded-full mr-1.5 flex-shrink-0 ${getCategoryInfo(entry.type, entry.category).color}`}></div>
                                <span className={`truncate ${
                                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                  {entry.label} {occurrences > 1 ? `(×${occurrences})` : ''}
                                </span>
                              </div>
                              <span className={`font-medium whitespace-nowrap ${entry.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(totalAmount)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        ) : (
          <div className="mb-8">
            <h2 className={`text-xl font-semibold mb-4 ${
              isDarkMode ? 'text-gray-200' : 'text-slate-800'
            }`}>Calendar View</h2>
            
            <div className={`rounded-2xl shadow-lg border max-h-[70vh] overflow-y-auto transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-gray-800/80 backdrop-blur-sm border-gray-700/50' 
                : 'bg-white/80 backdrop-blur-sm border-white/20'
            }`}>
              <div className={`divide-y ${
                isDarkMode ? 'divide-gray-700' : 'divide-slate-200'
              }`}>
                {generateCalendarPeriods().map((period, periodIndex) => (
                  <div key={periodIndex} className={`p-4 transition-colors duration-300 ${
                    period.isCurrent 
                      ? (isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50') 
                      : ''
                  }`}>
                    {/* Period Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          period.isCurrent 
                            ? 'bg-blue-500' 
                            : (isDarkMode ? 'bg-gray-600' : 'bg-slate-300')
                        }`}></div>
                        <div>
                          <h3 className={`font-semibold ${
                            period.isCurrent 
                              ? (isDarkMode ? 'text-blue-300' : 'text-blue-800') 
                              : (isDarkMode ? 'text-gray-200' : 'text-slate-800')
                          }`}>
                            {period.period}
                          </h3>
                          <p className={`text-xs ${
                            isDarkMode ? 'text-gray-400' : 'text-slate-600'
                          }`}>
                            {period.start.toLocaleDateString()} - {period.end.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {period.isCurrent && (
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          isDarkMode 
                            ? 'bg-blue-900/50 text-blue-300' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          Current
                        </span>
                      )}
                    </div>

                    {/* Entries as "Calendar Events" */}
                    <div className="space-y-2 mb-4">
                      {period.entries.map(entry => (
                        <div 
                          key={entry.id} 
                          className={`flex items-center p-2 rounded-lg border-l-4 transition-colors duration-300 ${
                            entry.type === 'income' 
                              ? (isDarkMode 
                                  ? 'border-emerald-500 bg-emerald-900/30' 
                                  : 'border-emerald-500 bg-emerald-50'
                                )
                              : (isDarkMode 
                                  ? 'border-red-500 bg-red-900/30' 
                                  : 'border-red-500 bg-red-50'
                                )
                          } ${!entry.isChecked ? 'opacity-50' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={entry.isChecked}
                            onChange={() => toggleEntryForPeriod(entry.id, period)}
                            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 focus:ring-1 mr-3 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className={`font-medium truncate ${
                                isDarkMode ? 'text-gray-200' : 'text-slate-800'
                              }`}>
                                {entry.label}
                              </span>
                              <span className={`font-bold ${entry.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                                {formatCurrency(entry.totalAmount)}
                              </span>
                            </div>
                            <div className={`flex items-center text-xs mt-1 ${
                              isDarkMode ? 'text-gray-400' : 'text-slate-500'
                            }`}>
                              <Clock size={12} className="mr-1" />
                              <span>
                                {entry.recurrenceType === 'single' ? 'One-time' :
                                 entry.recurrenceType === 'monthly' ? 'Monthly' : 
                                 entry.recurrenceType === 'semimonthly' ? 'Semi-monthly' : 
                                 'Bi-weekly'}
                                {entry.occurrences > 1 && ` (${entry.occurrences}×)`}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {period.entries.length === 0 && (
                        <div className={`text-center py-4 text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-slate-500'
                        }`}>
                          No entries for this period
                        </div>
                      )}
                    </div>

                    {/* Period Totals */}
                    <div className={`border-t pt-3 ${
                      isDarkMode ? 'border-gray-700' : 'border-slate-200'
                    }`}>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <p className="text-emerald-600 font-medium">Income</p>
                          <p className="text-lg font-bold text-emerald-700">
                            {formatCurrency(period.totalIncome)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-red-600 font-medium">Expenses</p>
                          <p className="text-lg font-bold text-red-700">
                            {formatCurrency(period.totalExpenses)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className={`font-medium ${period.netAmount >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                            Net
                          </p>
                          <p className={`text-lg font-bold ${period.netAmount >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                            {formatCurrency(period.netAmount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className={`p-8 rounded-2xl shadow-lg border mb-8 transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-gray-800/80 backdrop-blur-sm border-gray-700/50' 
            : 'bg-white/80 backdrop-blur-sm border-white/20'
        }`}>
          <h2 className={`text-2xl font-semibold mb-6 flex items-center ${
            isDarkMode ? 'text-gray-200' : 'text-slate-800'
          }`}>
            <div className={`p-2 rounded-xl mr-3 ${
              isDarkMode ? 'bg-blue-900/50' : 'bg-blue-100'
            }`}>
              <PlusCircle size={24} className="text-blue-600" />
            </div>
            Add New Entry
          </h2>
        
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className={`block text-sm font-semibold mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-slate-700'
              }`}>Label</label>
            <input
              type="text"
              value={newEntry.label}
              onChange={(e) => setNewEntry({...newEntry, label: e.target.value})}
              placeholder="e.g., Salary, Rent, Groceries"
              className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm ${
                isDarkMode 
                  ? 'border-gray-600 bg-gray-700/50 text-gray-200 placeholder-gray-400' 
                  : 'border-slate-300 bg-white/50 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>
          
          <div>
            <label className={`block text-sm font-semibold mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-slate-700'
            }`}>Amount (₱)</label>
            <input
              type="number"
              step="0.01"
              value={newEntry.amount}
              onChange={(e) => setNewEntry({...newEntry, amount: e.target.value})}
              placeholder="0.00"
              className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm ${
                isDarkMode 
                  ? 'border-gray-600 bg-gray-700/50 text-gray-200 placeholder-gray-400' 
                  : 'border-slate-300 bg-white/50 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>
          
          <div>
            <label className={`block text-sm font-semibold mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-slate-700'
            }`}>Type</label>
            <select
              value={newEntry.type}
              onChange={(e) => setNewEntry({...newEntry, type: e.target.value, category: ''})}
              className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm ${
                isDarkMode 
                  ? 'border-gray-600 bg-gray-700/50 text-gray-200' 
                  : 'border-slate-300 bg-white/50 text-slate-900'
              }`}
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          
          <div>
            <label className={`block text-sm font-semibold mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-slate-700'
            }`}>Category</label>
            <select
              value={newEntry.category}
              onChange={(e) => setNewEntry({...newEntry, category: e.target.value})}
              className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm ${
                isDarkMode 
                  ? 'border-gray-600 bg-gray-700/50 text-gray-200' 
                  : 'border-slate-300 bg-white/50 text-slate-900'
              }`}
            >
              <option value="">Select category...</option>
              {Object.entries(getAvailableCategories(newEntry.type)).map(([key, category]) => (
                <option key={key} value={key}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className={`block text-sm font-semibold mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-slate-700'
            }`}>Recurrence</label>
            <div className="flex flex-wrap gap-4 mt-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="single"
                  checked={newEntry.recurrenceType === 'single'}
                  onChange={(e) => setNewEntry({...newEntry, recurrenceType: e.target.value})}
                  className="mr-2"
                />
                <span className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-slate-700'
                }`}>Single occurrence</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="biweekly"
                  checked={newEntry.recurrenceType === 'biweekly'}
                  onChange={(e) => setNewEntry({...newEntry, recurrenceType: e.target.value})}
                  className="mr-2"
                />
                <span className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-slate-700'
                }`}>Bi-weekly</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="semimonthly"
                  checked={newEntry.recurrenceType === 'semimonthly'}
                  onChange={(e) => setNewEntry({...newEntry, recurrenceType: e.target.value})}
                  className="mr-2"
                />
                <span className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-slate-700'
                }`}>Semi-monthly</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="monthly"
                  checked={newEntry.recurrenceType === 'monthly'}
                  onChange={(e) => setNewEntry({...newEntry, recurrenceType: e.target.value})}
                  className="mr-2"
                />
                <span className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-slate-700'
                }`}>Monthly</span>
              </label>
            </div>
          </div>
          
          {newEntry.recurrenceType === 'single' ? (
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>Billing Date</label>
              <input
                type="date"
                value={newEntry.billingDate}
                onChange={(e) => setNewEntry({...newEntry, billingDate: e.target.value})}
                className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700/50 text-gray-200' 
                    : 'border-slate-300 bg-white/50 text-slate-900'
                }`}
              />
            </div>
          ) : newEntry.recurrenceType === 'semimonthly' ? (
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>Start Period</label>
              <select
                value={newEntry.startPeriod}
                onChange={(e) => setNewEntry({...newEntry, startPeriod: e.target.value})}
                className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700/50 text-gray-200' 
                    : 'border-slate-300 bg-white/50 text-slate-900'
                }`}
              >
                <option value="">Select start period...</option>
                {generateSemiMonthlyOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>Start Date</label>
              <input
                type="date"
                value={newEntry.startDate}
                onChange={(e) => setNewEntry({...newEntry, startDate: e.target.value})}
                className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700/50 text-gray-200' 
                    : 'border-slate-300 bg-white/50 text-slate-900'
                }`}
              />
            </div>
          )}
          
          <div className="md:col-span-2">
            {newEntry.recurrenceType !== 'single' && (
              <>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="indefinite"
                    checked={newEntry.isIndefinite}
                    onChange={(e) => setNewEntry({...newEntry, isIndefinite: e.target.checked, endDate: e.target.checked ? '' : newEntry.endDate, endPeriod: e.target.checked ? '' : newEntry.endPeriod})}
                    className="mr-2"
                  />
                  <label htmlFor="indefinite" className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Recurring indefinitely
                  </label>
                </div>
                
                {!newEntry.isIndefinite && (
                  <div>
                    {newEntry.recurrenceType === 'semimonthly' ? (
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>End Period</label>
                        <select
                          value={newEntry.endPeriod}
                          onChange={(e) => setNewEntry({...newEntry, endPeriod: e.target.value})}
                          className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm ${
                            isDarkMode 
                              ? 'border-gray-600 bg-gray-700/50 text-gray-200' 
                              : 'border-slate-300 bg-white/50 text-slate-900'
                          }`}
                        >
                          <option value="">Select end period...</option>
                          {generateSemiMonthlyOptions().map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>End Date</label>
                        <input
                          type="date"
                          value={newEntry.endDate}
                          onChange={(e) => setNewEntry({...newEntry, endDate: e.target.value})}
                          className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm ${
                            isDarkMode 
                              ? 'border-gray-600 bg-gray-700/50 text-gray-200' 
                              : 'border-slate-300 bg-white/50 text-slate-900'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
          <button
            onClick={addEntry}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center font-medium shadow-lg shadow-blue-500/25"
          >
            <PlusCircle className="mr-3" size={20} />
            Add Entry
          </button>
        </div>

        <div className={`rounded-2xl shadow-lg border p-8 transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-gray-800/80 backdrop-blur-sm border-gray-700/50' 
            : 'bg-white/80 backdrop-blur-sm border-white/20'
        }`}>
          <div className="mb-6">
            <h2 className={`text-2xl font-semibold text-center mb-4 ${
              isDarkMode ? 'text-gray-200' : 'text-slate-800'
            }`}>All Entries</h2>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto mb-4">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  isDarkMode ? 'text-gray-400' : 'text-slate-400'
                }`} size={18} />
                <input
                  type="text"
                  placeholder="Search entries by name, category, type, or amount..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-colors duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400' 
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-blue-500'
                  } focus:ring-2 focus:ring-blue-500/20 focus:outline-none`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 ${
                      isDarkMode ? 'text-gray-400 hover:bg-gray-600' : 'text-slate-400 hover:bg-gray-100'
                    }`}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-center flex-wrap gap-2">
              <span className={`text-sm mr-2 ${
                isDarkMode ? 'text-gray-400' : 'text-slate-600'
              }`}>Sort by:</span>
              
              <button
                onClick={() => handleSort('alphabetical')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                  entrySortBy === 'alphabetical'
                    ? (isDarkMode 
                        ? 'bg-blue-900/50 text-blue-300 shadow-sm' 
                        : 'bg-blue-100 text-blue-700 shadow-sm'
                      )
                    : (isDarkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      )
                }`}
              >
                A-Z
                {entrySortBy === 'alphabetical' && (
                  entrySortOrder === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                )}
              </button>
              
              <button
                onClick={() => handleSort('type')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                  entrySortBy === 'type'
                    ? (isDarkMode 
                        ? 'bg-blue-900/50 text-blue-300 shadow-sm' 
                        : 'bg-blue-100 text-blue-700 shadow-sm'
                      )
                    : (isDarkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      )
                }`}
              >
                Type
                {entrySortBy === 'type' && (
                  entrySortOrder === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                )}
              </button>
              
              <button
                onClick={() => handleSort('category')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                  entrySortBy === 'category'
                    ? (isDarkMode 
                        ? 'bg-blue-900/50 text-blue-300 shadow-sm' 
                        : 'bg-blue-100 text-blue-700 shadow-sm'
                      )
                    : (isDarkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      )
                }`}
              >
                Category
                {entrySortBy === 'category' && (
                  entrySortOrder === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                )}
              </button>
              
              <button
                onClick={() => handleSort('recurrence')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                  entrySortBy === 'recurrence'
                    ? (isDarkMode 
                        ? 'bg-blue-900/50 text-blue-300 shadow-sm' 
                        : 'bg-blue-100 text-blue-700 shadow-sm'
                      )
                    : (isDarkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      )
                }`}
              >
                Recurrence
                {entrySortBy === 'recurrence' && (
                  entrySortOrder === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                )}
              </button>
              
              <button
                onClick={() => handleSort('active')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                  entrySortBy === 'active'
                    ? (isDarkMode 
                        ? 'bg-blue-900/50 text-blue-300 shadow-sm' 
                        : 'bg-blue-100 text-blue-700 shadow-sm'
                      )
                    : (isDarkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      )
                }`}
              >
                Status
                {entrySortBy === 'active' && (
                  entrySortOrder === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                )}
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
        
            {entries.length === 0 && (
              <div className="text-center py-12">
                <div className={`p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center ${
                  isDarkMode ? 'bg-gray-700' : 'bg-slate-100'
                }`}>
                  <Calendar className={`${
                    isDarkMode ? 'text-gray-500' : 'text-slate-400'
                  }`} size={32} />
                </div>
                <p className={`text-lg ${
                  isDarkMode ? 'text-gray-400' : 'text-slate-500'
                }`}>No entries yet. Add your first income or expense above!</p>
              </div>
            )}
            {entries.length > 0 && getFilteredAndSortedEntries().map(entry => {
              const isActive = isEntryActive(entry);
              const isEditing = editingEntry && editingEntry.id === entry.id;
              
              if (isEditing) {
                return (
                <div
                  key={entry.id}
                  className={`p-4 rounded-lg border transition-colors duration-300 ${
                    isDarkMode 
                      ? 'border-blue-600/50 bg-blue-900/30' 
                      : 'border-blue-300 bg-blue-50'
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>Label</label>
                      <input
                        type="text"
                        value={editingEntry.label}
                        onChange={(e) => setEditingEntry({...editingEntry, label: e.target.value})}
                        className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm ${
                          isDarkMode 
                            ? 'border-gray-600 bg-gray-700/50 text-gray-200' 
                            : 'border-slate-300 bg-white/50 text-slate-900'
                        }`}
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>Amount (₱)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingEntry.amount}
                        onChange={(e) => setEditingEntry({...editingEntry, amount: e.target.value})}
                        className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm ${
                          isDarkMode 
                            ? 'border-gray-600 bg-gray-700/50 text-gray-200' 
                            : 'border-slate-300 bg-white/50 text-slate-900'
                        }`}
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>Type</label>
                      <select
                        value={editingEntry.type}
                        onChange={(e) => setEditingEntry({...editingEntry, type: e.target.value, category: ''})}
                        className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm ${
                          isDarkMode 
                            ? 'border-gray-600 bg-gray-700/50 text-gray-200' 
                            : 'border-slate-300 bg-white/50 text-slate-900'
                        }`}
                      >
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>Category</label>
                      <select
                        value={editingEntry.category || ''}
                        onChange={(e) => setEditingEntry({...editingEntry, category: e.target.value})}
                        className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm ${
                          isDarkMode 
                            ? 'border-gray-600 bg-gray-700/50 text-gray-200' 
                            : 'border-slate-300 bg-white/50 text-slate-900'
                        }`}
                      >
                        <option value="">Select category...</option>
                        {Object.entries(getAvailableCategories(editingEntry.type)).map(([key, category]) => (
                          <option key={key} value={key}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>Recurrence</label>
                      <div className="flex flex-wrap gap-4 mt-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="single"
                            checked={editingEntry.recurrenceType === 'single'}
                            onChange={(e) => setEditingEntry({...editingEntry, recurrenceType: e.target.value})}
                            className="mr-2"
                          />
                          <span className={`text-sm ${
                            isDarkMode ? 'text-gray-300' : 'text-slate-700'
                          }`}>Single occurrence</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="biweekly"
                            checked={editingEntry.recurrenceType === 'biweekly'}
                            onChange={(e) => setEditingEntry({...editingEntry, recurrenceType: e.target.value})}
                            className="mr-2"
                          />
                          <span className={`text-sm ${
                            isDarkMode ? 'text-gray-300' : 'text-slate-700'
                          }`}>Bi-weekly</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="semimonthly"
                            checked={editingEntry.recurrenceType === 'semimonthly'}
                            onChange={(e) => setEditingEntry({...editingEntry, recurrenceType: e.target.value})}
                            className="mr-2"
                          />
                          <span className={`text-sm ${
                            isDarkMode ? 'text-gray-300' : 'text-slate-700'
                          }`}>Semi-monthly</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="monthly"
                            checked={editingEntry.recurrenceType === 'monthly'}
                            onChange={(e) => setEditingEntry({...editingEntry, recurrenceType: e.target.value})}
                            className="mr-2"
                          />
                          <span className={`text-sm ${
                            isDarkMode ? 'text-gray-300' : 'text-slate-700'
                          }`}>Monthly</span>
                        </label>
                      </div>
                    </div>
                    
                    {editingEntry.recurrenceType === 'single' ? (
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>Billing Date</label>
                        <input
                          type="date"
                          value={editingEntry.billingDate}
                          onChange={(e) => setEditingEntry({...editingEntry, billingDate: e.target.value})}
                          className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm ${
                            isDarkMode 
                              ? 'border-gray-600 bg-gray-700/50 text-gray-200' 
                              : 'border-slate-300 bg-white/50 text-slate-900'
                          }`}
                        />
                      </div>
                    ) : editingEntry.recurrenceType === 'semimonthly' ? (
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>Start Period</label>
                        <select
                          value={editingEntry.startPeriod}
                          onChange={(e) => setEditingEntry({...editingEntry, startPeriod: e.target.value})}
                          className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm ${
                            isDarkMode 
                              ? 'border-gray-600 bg-gray-700/50 text-gray-200' 
                              : 'border-slate-300 bg-white/50 text-slate-900'
                          }`}
                        >
                          <option value="">Select start period...</option>
                          {generateSemiMonthlyOptions().map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>Start Date</label>
                        <input
                          type="date"
                          value={editingEntry.startDate}
                          onChange={(e) => setEditingEntry({...editingEntry, startDate: e.target.value})}
                          className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm ${
                            isDarkMode 
                              ? 'border-gray-600 bg-gray-700/50 text-gray-200' 
                              : 'border-slate-300 bg-white/50 text-slate-900'
                          }`}
                        />
                      </div>
                    )}
                    
                    <div>
                      {editingEntry.recurrenceType !== 'single' && (
                        <>
                          <div className="flex items-center mb-2">
                            <input
                              type="checkbox"
                              id={`edit-indefinite-${entry.id}`}
                              checked={editingEntry.isIndefinite}
                              onChange={(e) => setEditingEntry({...editingEntry, isIndefinite: e.target.checked, endDate: e.target.checked ? '' : editingEntry.endDate, endPeriod: e.target.checked ? '' : editingEntry.endPeriod})}
                              className="mr-2"
                            />
                            <label htmlFor={`edit-indefinite-${entry.id}`} className={`text-sm font-medium ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              Recurring indefinitely
                            </label>
                          </div>
                          
                          {!editingEntry.isIndefinite && (
                            <div>
                              {editingEntry.recurrenceType === 'semimonthly' ? (
                                <div>
                                  <label className={`block text-sm font-medium mb-1 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                  }`}>End Period</label>
                                  <select
                                    value={editingEntry.endPeriod}
                                    onChange={(e) => setEditingEntry({...editingEntry, endPeriod: e.target.value})}
                                    className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm ${
                                      isDarkMode 
                                        ? 'border-gray-600 bg-gray-700/50 text-gray-200' 
                                        : 'border-slate-300 bg-white/50 text-slate-900'
                                    }`}
                                  >
                                    <option value="">Select end period...</option>
                                    {generateSemiMonthlyOptions().map(option => (
                                      <option key={option.value} value={option.value}>
                                        {option.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              ) : (
                                <div>
                                  <label className={`block text-sm font-medium mb-1 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                  }`}>End Date</label>
                                  <input
                                    type="date"
                                    value={editingEntry.endDate}
                                    onChange={(e) => setEditingEntry({...editingEntry, endDate: e.target.value})}
                                    className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm ${
                                      isDarkMode 
                                        ? 'border-gray-600 bg-gray-700/50 text-gray-200' 
                                        : 'border-slate-300 bg-white/50 text-slate-900'
                                    }`}
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={saveEdit}
                      className={`px-3 py-1 rounded-md transition-colors flex items-center text-sm ${
                        isDarkMode 
                          ? 'bg-green-700 text-white hover:bg-green-600' 
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      <Save className="mr-1" size={14} />
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className={`px-3 py-1 rounded-md transition-colors flex items-center text-sm ${
                        isDarkMode 
                          ? 'bg-gray-700 text-white hover:bg-gray-600' 
                          : 'bg-gray-600 text-white hover:bg-gray-700'
                      }`}
                    >
                      <X className="mr-1" size={14} />
                      Cancel
                    </button>
                  </div>
                </div>
              );
            }
            
            return (
              <div
                key={entry.id}
                className={`p-6 rounded-2xl border transition-all duration-200 ${
                  isActive 
                    ? entry.type === 'income' 
                      ? (isDarkMode 
                          ? 'bg-gradient-to-r from-emerald-900/30 to-green-900/30 border-emerald-600/50 shadow-sm' 
                          : 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 shadow-sm'
                        )
                      : (isDarkMode 
                          ? 'bg-gradient-to-r from-red-900/30 to-rose-900/30 border-red-600/50 shadow-sm' 
                          : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200 shadow-sm'
                        )
                    : (isDarkMode 
                        ? 'bg-gray-800/50 border-gray-700/50' 
                        : 'bg-slate-50 border-slate-200'
                      )
                } ${!isActive ? 'opacity-60' : 'hover:shadow-md'}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className={`w-3 h-3 rounded-full mr-2 flex-shrink-0 ${
                        getCategoryInfo(entry.type, entry.category).color
                      }`}></div>
                      <h3 className={`font-semibold text-lg ${
                        isDarkMode ? 'text-gray-200' : 'text-slate-800'
                      }`}>{entry.label}</h3>
                      {isActive && (
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                          isDarkMode 
                            ? 'bg-green-900/50 text-green-300' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          Active
                        </span>
                      )}
                    </div>
                    
                    <div className={`grid grid-cols-1 md:grid-cols-4 gap-2 text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <div className="flex items-center">
                        <DollarSign size={14} className="mr-1" />
                        <span className={`font-semibold ${entry.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(entry.amount)} ({entry.type})
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-1 ${
                          getCategoryInfo(entry.type, entry.category).color
                        }`}></div>
                        <span className="truncate">
                          {getCategoryInfo(entry.type, entry.category).label.replace(/^.+?\s/, '')}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1" />
                        <span>
                          {entry.recurrenceType === 'semimonthly' 
                            ? `${entry.startPeriod ? generateSemiMonthlyOptions().find(opt => opt.value === entry.startPeriod)?.label || entry.startPeriod : 'N/A'} - ${entry.isIndefinite ? 'Indefinite' : (entry.endPeriod ? generateSemiMonthlyOptions().find(opt => opt.value === entry.endPeriod)?.label || entry.endPeriod : 'N/A')}`
                            : `${entry.startDate ? formatDate(entry.startDate) : 'N/A'} - ${entry.isIndefinite ? 'Indefinite' : (entry.endDate ? formatDate(entry.endDate) : 'N/A')}`
                          }
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        <span>
                          {entry.recurrenceType === 'single' ? 'One-time occurrence' :
                           entry.recurrenceType === 'monthly' ? 'Every month' : 
                           entry.recurrenceType === 'semimonthly' ? 'Every cutoff (1st & 16th)' : 
                           'Every 2 weeks'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-1">
                    <button
                      onClick={() => startEditing(entry)}
                      className={`p-1 transition-colors duration-200 ${
                        isDarkMode 
                          ? 'text-blue-400 hover:text-blue-300' 
                          : 'text-blue-500 hover:text-blue-700'
                      }`}
                      title="Edit entry"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => removeEntry(entry.id)}
                      className={`p-1 transition-colors duration-200 ${
                        isDarkMode 
                          ? 'text-red-400 hover:text-red-300' 
                          : 'text-red-500 hover:text-red-700'
                      }`}
                      title="Remove entry"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
            })}
        </div>
      </div>
      </div>
    </div>

    {/* Adjustment Modal */}
    {adjustmentModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`p-6 rounded-2xl shadow-xl max-w-md w-full mx-4 ${
          isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            isDarkMode ? 'text-gray-200' : 'text-slate-800'
          }`}>
            Adjust Amount - {adjustmentModal.period.period}
          </h3>
          
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <div className={`w-3 h-3 rounded-full mr-2 ${getCategoryInfo(adjustmentModal.entry.type, adjustmentModal.entry.category).color}`}></div>
              <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-slate-800'}`}>
                {adjustmentModal.entry.label}
              </span>
            </div>
            
            <div className={`text-sm space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
              <div>Base Amount: {formatCurrency(adjustmentModal.entry.amount)}</div>
              <div>Current Adjustment: {formatCurrency(parseFloat(adjustmentAmount) || 0)}</div>
              <div className="border-t pt-1 font-medium">
                New Total: {formatCurrency(adjustmentModal.entry.amount + (parseFloat(adjustmentAmount) || 0))}
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-slate-700'
            }`}>
              Adjustment Amount (use negative for decreases)
            </label>
            <div className="relative">
              <span className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                isDarkMode ? 'text-gray-400' : 'text-slate-400'
              }`}>₱</span>
              <input
                type="number"
                value={adjustmentAmount}
                onChange={(e) => setAdjustmentAmount(e.target.value)}
                placeholder="0.00"
                className={`w-full pl-8 pr-4 py-2 border rounded-lg transition-colors duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            
            {/* Quick preset buttons */}
            <div className="flex flex-wrap gap-2 mt-2">
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Quick:</span>
              {[-50, -25, -10, 10, 25, 50].map(amount => (
                <button
                  key={amount}
                  onClick={() => setAdjustmentAmount(amount.toString())}
                  className={`px-2 py-1 text-xs rounded transition-colors duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {amount > 0 ? '+' : ''}{amount}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setAdjustmentModal(null)}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={saveAdjustment}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default BudgetTracker;