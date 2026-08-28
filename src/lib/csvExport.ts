export function exportEntriesToCSV(entries: any[], currencyCode: string = 'PHP') {
  if (!entries || entries.length === 0) {
    alert('No entries available to export.');
    return;
  }

  const headers = ['ID', 'Type', 'Label', 'Category', 'Amount', 'Recurrence', 'Billing Date', 'Start Period', 'End Period'];

  const rows = entries.map((e) => [
    e.id || '',
    e.type || 'expense',
    `"${(e.label || '').replace(/"/g, '""')}"`,
    `"${(e.category || '').replace(/"/g, '""')}"`,
    e.amount || 0,
    e.recurrenceType || '',
    e.billingDate || '',
    e.startPeriod || e.startDate || '',
    e.endPeriod || e.endDate || '',
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `budget_report_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
