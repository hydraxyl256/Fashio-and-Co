/**
 * Locale-aware formatters. Default locale is en-KE because the brand is
 * Nairobi-based, but every formatter accepts an override.
 */

const DEFAULT_LOCALE = 'en-KE';
const DEFAULT_CURRENCY = 'KES';

export function formatCurrency(
  amountInCents: number,
  options: { currency?: string; locale?: string } = {},
): string {
  const { currency = DEFAULT_CURRENCY, locale = DEFAULT_LOCALE } = options;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amountInCents / 100);
}

export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'long' },
  locale: string = DEFAULT_LOCALE,
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, options).format(d);
}

export function formatNumber(value: number, locale: string = DEFAULT_LOCALE): string {
  return new Intl.NumberFormat(locale).format(value);
}
