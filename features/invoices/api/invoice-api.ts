import type {
  InvoiceListParams,
  InvoiceListResponse,
  CreateInvoicePayload,
  CreateInvoiceResponse,
} from "@/features/invoices/types/invoice.types";
import { invoiceApiUrl } from "@/lib/env";

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

  return response.json();
}

export async function createInvoice(
  accessToken: string,
  orgToken: string,
  data: CreateInvoicePayload
): Promise<CreateInvoiceResponse> {
  const response = await fetch(`${invoiceApiUrl}/invoices`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Org-Token": orgToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to create invoice: ${response.status} ${text}`);
  }

  return response.json();
}
