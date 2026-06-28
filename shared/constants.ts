export const APP_NAME = "SimpleInvoice";
export const APP_DESCRIPTION = "Simple Invoice Management";

export const INVOICE_STATUS_LABELS: Record<string, string> = {
  Due: "Due",
  Overdue: "Overdue",
  Paid: "Paid",
  Cancelled: "Cancelled",
  Rejected: "Rejected",
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CNY: "¥",
  AUD: "A$",
  CAD: "C$",
  CHF: "CHF",
  HKD: "HK$",
  SGD: "S$",
  INR: "₹",
  IDR: "Rp",
  MYR: "RM",
  THB: "฿",
  PHP: "₱",
  VND: "₫",
};

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export const DATE_FORMAT = "YYYY-MM-DD";
export const DISPLAY_DATE_FORMAT = "MMM d, yyyy";

export const AUTH_TOKEN_COOKIES = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  ID_TOKEN: "id_token",
  ORG_TOKEN: "org_token",
} as const;

/**
 * Back-compat alias — older imports reference AUTH_COOKIE_NAMES.
 */
export const AUTH_COOKIE_NAMES = AUTH_TOKEN_COOKIES;

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
};

export const ROUTES = {
  LOGIN: "/login",
  INVOICES: "/invoices",
  CREATE_INVOICE: "/invoices/create",
} as const;
