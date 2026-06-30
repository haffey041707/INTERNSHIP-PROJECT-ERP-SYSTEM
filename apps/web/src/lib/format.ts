/** Money: integer minor units → display string. */
export function money(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(cents / 100);
}

/** "June 25, 2026" */
export function longDate(d: Date | string): string {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/** Whole days since a date, inclusive of today (day 1 = signup day). */
export function daysSince(d: Date | string): number {
  const ms = Date.now() - new Date(d).getTime();
  return Math.max(1, Math.floor(ms / 86_400_000) + 1);
}

/** Last N calendar dates as YYYY-MM-DD, oldest → newest. */
export function lastDays(n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return d.toISOString().slice(0, 10);
  });
}
