export function parseDateOnlyUtc(value: string | Date): Date {
  if (value instanceof Date) {
    const iso = value.toISOString().slice(0, 10);
    return new Date(`${iso}T00:00:00.000Z`);
  }
  const datePart = String(value).trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    throw new Error(`Invalid YYYY-MM-DD date: ${value}`);
  }
  return new Date(`${datePart}T00:00:00.000Z`);
}

export function formatDateOnly(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return String(value).slice(0, 10);
}

export function addUtcDays(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

export function computeFullYearsDiff(fromDate: Date | string, refDate: Date = new Date()): number {
  const start = parseDateOnlyUtc(fromDate);
  const end = parseDateOnlyUtc(refDate);
  let years = end.getUTCFullYear() - start.getUTCFullYear();
  const m = end.getUTCMonth() - start.getUTCMonth();
  if (m < 0 || (m === 0 && end.getUTCDate() < start.getUTCDate())) {
    years--;
  }
  return Math.max(0, years);
}

export function roundMoney2(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}
