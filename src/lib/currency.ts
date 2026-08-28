export interface Currency {
  code: string;
  symbol: string;
  label: string;
}

export const CURRENCIES: Record<string, Currency> = {
  PHP: { code: 'PHP', symbol: '₱', label: 'PHP (₱) - Philippine Peso' },
  USD: { code: 'USD', symbol: '$', label: 'USD ($) - US Dollar' },
  EUR: { code: 'EUR', symbol: '€', label: 'EUR (€) - Euro' },
  GBP: { code: 'GBP', symbol: '£', label: 'GBP (£) - British Pound' },
  JPY: { code: 'JPY', symbol: '¥', label: 'JPY (¥) - Japanese Yen' },
  CAD: { code: 'CAD', symbol: 'CA$', label: 'CAD (CA$) - Canadian Dollar' },
  AUD: { code: 'AUD', symbol: 'AU$', label: 'AUD (AU$) - Australian Dollar' },
  SGD: { code: 'SGD', symbol: 'S$', label: 'SGD (S$) - Singapore Dollar' },
  INR: { code: 'INR', symbol: '₹', label: 'INR (₹) - Indian Rupee' },
};

export const DEFAULT_CURRENCY_CODE = 'PHP';

export function getCurrencySymbol(code: string = DEFAULT_CURRENCY_CODE): string {
  return CURRENCIES[code]?.symbol || '₱';
}

export function formatMoney(amount: number | string, currencyCode: string = DEFAULT_CURRENCY_CODE): string {
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
