import type {
  CreateInvoicePayload,
  CreateInvoiceResponse,
  InvoiceListParams,
  InvoiceListResponse,
} from "@/features/invoices/types/invoice.types";
import { authedFetch } from "@/lib/authed-fetch";

function buildQuery(params: InvoiceListParams): string {
  const search = new URLSearchParams();
  if (params.keyword) search.set("keyword", params.keyword);
  if (params.status) search.set("status", params.status);
  if (params.ordering) search.set("ordering", params.ordering);
  if (params.pageNum !== undefined) {
    search.set("pageNum", String(params.pageNum));
  }
  if (params.pageSize !== undefined) {
    search.set("pageSize", String(params.pageSize));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

function extractError(data: unknown, fallback: string): string {
  if (data && typeof data === "object" && "error" in data) {
    const value = (data as { error: unknown }).error;
    if (typeof value === "string" && value.length > 0) return value;
  }
  return fallback;
}

export async function listInvoicesRequest(
  params: InvoiceListParams = {}
): Promise<InvoiceListResponse> {
  const response = await authedFetch(`/api/invoices${buildQuery(params)}`, {
    method: "GET",
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(extractError(data, "Failed to fetch invoices"));
  }

  return data as InvoiceListResponse;
}

export async function createInvoiceRequest(
  payload: CreateInvoicePayload
): Promise<CreateInvoiceResponse> {
  const response = await authedFetch("/api/invoices", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(extractError(data, "Failed to create invoice"));
  }

  return data as CreateInvoiceResponse;
}