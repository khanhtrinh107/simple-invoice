import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatCurrency(
  amount: number,
  currency: string
): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/**
 * Formats a balance amount with parentheses for negative values.
 * Matches the Figma design: (-$270.00 CAD) for negative, $270.00 CAD for positive.
 */
export function formatBalance(
  amount: number | undefined | null,
  currency: string
): string {
  const value = amount ?? 0;
  if (value < 0) {
    const absFormatted = formatCurrency(Math.abs(value), currency);
    return `(${absFormatted})`;
  }
  return formatCurrency(value, currency);
}

export function calculateItemAmount(
  quantity: number | undefined | null,
  rate: number | undefined | null
): number {
  const q = Number(quantity);
  const r = Number(rate);
  if (!Number.isFinite(q) || !Number.isFinite(r)) return 0;
  return Math.round(q * r * 100) / 100;
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function capitalizeFirst(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
