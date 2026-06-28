import { NextResponse } from "next/server";
import type {
  InvoiceListParams,
  CreateInvoicePayload,
} from "@/features/invoices/types/invoice.types";
import { listInvoices, createInvoice } from "@/features/invoices/api/invoice-api";
import {
  clearAuthCookies,
  getAuthTokens,
  refreshAccessToken,
} from "@/lib/cookies";
import { createInvoiceSchema } from "@/shared/validators";

export async function GET(request: Request) {
  const tokens = await getAuthTokens();

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

  if (!tokens) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await listInvoices(
      tokens.accessToken,
      tokens.orgToken,
      params
    );
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    const isAuthFailure =
      err instanceof Error &&
      (err.message.includes("401") ||
        err.message.toLowerCase().includes("unauthorized"));

    if (!isAuthFailure) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch invoices";
      return NextResponse.json({ error: message }, { status: 502 });
    }

    // access_token may have expired — attempt a silent refresh.
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      // Session is unrecoverable. Clear cookies so subsequent requests
      // (including the login page's auth check) don't see a stale token
      // and redirect the user right back into the loop.
      await clearAuthCookies();
      return NextResponse.json(
        { error: "Session expired" },
        { status: 401 }
      );
    }

    try {
      const result = await listInvoices(
        refreshed.accessToken,
        refreshed.orgToken,
        params
      );
      return NextResponse.json(result, { status: 200 });
    } catch (retryErr) {
      const message =
        retryErr instanceof Error
          ? retryErr.message
          : "Failed to fetch invoices after token refresh";
      return NextResponse.json({ error: message }, { status: 502 });
    }
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
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
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
    const result = await createInvoice(
      tokens.accessToken,
      tokens.orgToken,
      payload
    );
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const isAuthFailure =
      err instanceof Error &&
      (err.message.includes("401") ||
        err.message.toLowerCase().includes("unauthorized"));

    if (!isAuthFailure) {
      const message =
        err instanceof Error ? err.message : "Failed to create invoice";
      return NextResponse.json({ error: message }, { status: 502 });
    }

    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      await clearAuthCookies();
      return NextResponse.json(
        { error: "Session expired" },
        { status: 401 }
      );
    }

    try {
      const result = await createInvoice(
        refreshed.accessToken,
        refreshed.orgToken,
        payload
      );
      return NextResponse.json(result, { status: 201 });
    } catch (retryErr) {
      const message =
        retryErr instanceof Error
          ? retryErr.message
          : "Failed to create invoice after token refresh";
      return NextResponse.json({ error: message }, { status: 502 });
    }
  }
}
