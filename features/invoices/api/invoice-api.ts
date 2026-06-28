import type {
  InvoiceListParams,
  InvoiceListResponse,
  CreateInvoicePayload,
  CreateInvoiceResponse,
} from "@/features/invoices/types/invoice.types";
import { invoiceApiUrl } from "@/lib/env";

/* ─── Upstream (101 Digital) wire types ─────────────────────────────── */

interface UpstreamPaging {
  pageNumber?: number;
  pageSize?: number;
  totalRecords?: number;
}

interface UpstreamListEnvelope {
  data?: unknown;
  paging?: UpstreamPaging;
}

interface UpstreamAddress {
  premise?: string;
  countryCode?: string;
  postcode?: string;
  county?: string;
  city?: string;
  addressType?: string;
}

interface UpstreamContact {
  email?: string;
  mobileNumber?: string;
}

interface UpstreamCustomer {
  firstName?: string;
  lastName?: string;
  contact?: UpstreamContact;
  addresses?: UpstreamAddress[];
}

interface UpstreamBankAccount {
  bankId?: string;
  sortCode?: string;
  accountNumber?: string;
  accountName?: string;
}

interface UpstreamItem {
  itemReference?: string;
  description?: string;
  quantity?: number;
  rate?: number;
  itemName?: string;
  itemUOM?: string;
}

interface UpstreamInvoice {
  bankAccount?: UpstreamBankAccount;
  customer?: UpstreamCustomer;
  invoiceReference?: string;
  invoiceNumber?: string;
  currency?: string;
  invoiceDate?: string;
  dueDate?: string;
  description?: string;
  items?: UpstreamItem[];
}

/* ─── Internal types (already in invoice.types.ts) ──────────────────── */

interface UpstreamInvoiceForList {
  invoiceId?: string;
  id?: string;
  customer?: {
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    id?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/* ─── Payload transformation ─────────────────────────────────────────── */

/**
 * Derive a two-letter ISO 3166-1 alpha-2 country code from a country name.
 * Uses the first two uppercase letters of the country name.
 */
function deriveCountryCode(country?: string): string {
  if (!country || country.trim() === "") return "";
  return country.trim().slice(0, 2).toUpperCase();
}

/**
 * Split a display name into firstName / lastName.
 * Uses the first word as firstName and everything else as lastName.
 */
function splitName(displayName?: string): { firstName: string; lastName: string } {
  if (!displayName || displayName.trim() === "") {
    return { firstName: "", lastName: "" };
  }
  const parts = displayName.trim().split(/\s+/);
  const firstName = parts[0] ?? "";
  const lastName = parts.slice(1).join(" ");
  return { firstName, lastName };
}

/**
 * Map the internal `CreateInvoicePayload` (form shape) to the wire format
 * expected by the 101 Digital invoice-service API.
 *
 * Key transformations:
 *   - Body must be wrapped in `{ invoices: [...] }`
 *   - `customer.name` → `customer.firstName` / `customer.lastName`
 *   - `customer.contact.phone` → `customer.contact.mobileNumber`
 *   - `customer.address.*` → `customer.addresses[0].*` (single address, type=BILLING)
 *   - `bankAccount.*` field names are remapped (routingCode→sortCode,
 *     accountHolderName→accountName, etc.)
 *   - `items[].name` → `items[].itemName`
 *   - `notes` + `terms` → `description` (upstream has no separate fields)
 *   - Missing fields (bankId, invoiceReference, itemUOM) → ""
 */
export function to101DigitalInvoicePayload(
  data: CreateInvoicePayload
): UpstreamInvoice {
  const { firstName, lastName } = splitName(data.customer.name);

  const descriptionParts: string[] = [];
  if (data.notes && data.notes.trim() !== "") {
    descriptionParts.push(data.notes.trim());
  }
  if (data.terms && data.terms.trim() !== "") {
    descriptionParts.push(data.terms.trim());
  }

  return {
    invoiceNumber: data.invoiceNumber,
    currency: data.currency,
    invoiceDate: data.invoiceDate,
    dueDate: data.dueDate,
    description: descriptionParts.join("\n") || undefined,
    invoiceReference: "",
    bankAccount: {
      bankId: "",
      sortCode: data.bankAccount?.routingCode ?? "",
      accountNumber: data.bankAccount?.accountNumber ?? "",
      accountName: data.bankAccount?.accountHolderName ?? "",
    },
    customer: {
      firstName,
      lastName,
      contact: {
        email: data.customer.contact?.email,
        mobileNumber: data.customer.contact?.phone,
      },
      addresses: [
        {
          premise: data.customer.address?.addressLine1 ?? "",
          city: data.customer.address?.city ?? "",
          county: data.customer.address?.state ?? "",
          postcode: data.customer.address?.postalCode ?? "",
          countryCode: deriveCountryCode(data.customer.address?.country),
          addressType: "BILLING",
        },
      ],
    },
    items: data.items.map((item, index) => ({
      itemReference: `item-${index}`,
      description: item.description ?? "",
      quantity: item.quantity ?? 1,
      rate: item.rate ?? 0,
      itemName: item.name ?? "",
      itemUOM: "",
    })),
  };
}

/**
 * Normalize a single upstream invoice record into the `Invoice` shape the UI
 * consumes. The upstream API uses:
 *   - `invoiceId` for the primary key  → remapped to `id`
 *   - `customer.firstName / lastName`  → remapped to `customer.name`
 *   - `customer.email`                → remapped to `customer.contact.email`
 *   - `status` as `[{ key, value }]`  → left as-is (InvoiceStatusBadge handles it)
 *   - `customer.id`                   → dropped (UUID has no UX value)
 */
function normalizeInvoice(raw: unknown): InvoiceListResponse["data"][number] {
  const upstream = (raw ?? {}) as UpstreamInvoiceForList;

  // Primary key: prefer `id`, fall back to `invoiceId`
  const id = upstream.id ?? upstream.invoiceId ?? "";

  // Customer normalization
  const rawCustomer = upstream.customer ?? {};
  const firstName = rawCustomer.firstName ?? "";
  const lastName = rawCustomer.lastName ?? "";
  const displayName =
    rawCustomer.name ||
    [firstName, lastName].filter(Boolean).join(" ") ||
    "—";

  const normalizedCustomer = {
    ...rawCustomer,
    name: displayName,
    contact: rawCustomer.email
      ? { email: rawCustomer.email }
      : undefined,
    // Drop the upstream `customer.id` — UUID is noise in the UI and the
    // invoice already carries its own primary key on `id`.
    id: undefined,
  };

  return {
    ...(upstream as Record<string, unknown>),
    id,
    customer: normalizedCustomer as InvoiceListResponse["data"][number]["customer"],
  } as InvoiceListResponse["data"][number];
}

/**
 * Normalize the upstream list response (which uses `paging.pageNumber` /
 * `paging.pageSize` / `paging.totalRecords` and per-row `invoiceId`) into
 * the flat shape our UI consumes (`pageNum`, `pageSize`, `total`,
 * `totalPages`, and `Invoice.id`).
 *
 * Keeping this transformation server-side means the BFF stays in control of
 * the wire contract and the rest of the app can keep its existing types.
 *
 * Exported for unit testing.
 */
export function normalizeInvoiceListResponse(
  raw: unknown
): InvoiceListResponse {
  const envelope = (raw ?? {}) as UpstreamListEnvelope;
  const rawInvoices = Array.isArray(envelope.data) ? envelope.data : [];
  const invoices = rawInvoices.map(normalizeInvoice);

  const pageNumber = envelope.paging?.pageNumber ?? 1;
  const pageSize = envelope.paging?.pageSize ?? invoices.length ?? 0;
  const total = envelope.paging?.totalRecords ?? invoices.length;

  const totalPages =
    pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1;

  return {
    data: invoices as InvoiceListResponse["data"],
    total,
    pageNum: pageNumber,
    pageSize,
    totalPages,
  };
}

export async function listInvoices(
  accessToken: string,
  orgToken: string,
  params: InvoiceListParams = {}
): Promise<InvoiceListResponse> {
  const url = new URL(`${invoiceApiUrl}/invoices`);
  if (params.keyword) url.searchParams.set("keyword", params.keyword);
  if (params.status) url.searchParams.set("status", params.status);
  if (params.ordering) url.searchParams.set("ordering", params.ordering);
  if (params.pageNum !== undefined) url.searchParams.set("pageNum", String(params.pageNum));
  if (params.pageSize !== undefined) url.searchParams.set("pageSize", String(params.pageSize));

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Org-Token": orgToken,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to list invoices: ${response.status} ${text}`);
  }

  return normalizeInvoiceListResponse(await response.json());
}

export async function createInvoice(
  accessToken: string,
  orgToken: string,
  data: CreateInvoicePayload
): Promise<CreateInvoiceResponse> {
  const upstreamPayload = { invoices: [to101DigitalInvoicePayload(data)] };

  const response = await fetch(`${invoiceApiUrl}/invoices`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "org-token": orgToken,
      "Operation-Mode": "SYNC",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(upstreamPayload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to create invoice: ${response.status} ${text}`);
  }

  return response.json();
}
