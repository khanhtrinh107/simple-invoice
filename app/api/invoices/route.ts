import { NextResponse } from "next/server";
import type { InvoiceListParams, CreateInvoicePayload } from "@/features/invoices/types/invoice.types";
import { listInvoices, createInvoice } from "@/features/invoices/api/invoice-api";
import { getAuthTokens } from "@/lib/cookies";
import { createInvoiceSchema } from "@/shared/validators";

export async function GET(request: Request) {
  const tokens = await getAuthTokens();

  if (!tokens) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  const params: InvoiceListParams = {};

  const keyword = searchParams.get("keyword");
  if (keyword) params.keyword = keyword;

  const status = searchParams.get("status");
  if (status) params.status = status as InvoiceListParams["status"];

  const ordering = searchParams.get("ordering");
  if (ordering) params.ordering = ordering as InvoiceListParams["ordering"];

  const pageNum = searchParams.get("pageNum");
  if (pageNum) params.pageNum = parseInt(pageNum, 10);

  const pageSize = searchParams.get("pageSize");
  if (pageSize) params.pageSize = parseInt(pageSize, 10);

  try {
    const result = await listInvoices(tokens.accessToken, tokens.orgToken, params);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch invoices";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const tokens = await getAuthTokens();

  if (!tokens) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = createInvoiceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const payload = parsed.data as CreateInvoicePayload;

  try {
    const result = await createInvoice(tokens.accessToken, tokens.orgToken, payload);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create invoice";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
