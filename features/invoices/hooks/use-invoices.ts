"use client";

import * as React from "react";
import type {
  InvoiceListParams,
  InvoiceListResponse,
} from "@/features/invoices/types/invoice.types";
import { listInvoicesRequest } from "@/features/invoices/api/invoice-client";

interface UseInvoicesState {
  data: InvoiceListResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Fetches invoices whenever the params object changes.
 * Caller is responsible for debouncing `params.keyword` before passing.
 *
 * 401 responses are handled by the global fetch interceptor (see
 * `lib/fetch-interceptor`), which redirects to `/login` before this hook
 * ever sees the response — so this hook only surfaces non-auth errors.
 */
export function useInvoices(params: InvoiceListParams): UseInvoicesState {
  const [data, setData] = React.useState<InvoiceListResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [reloadToken, setReloadToken] = React.useState<number>(0);

  // Stable string key so referentially-equal params objects don't refetch.
  const paramsKey = React.useMemo(
    () =>
      JSON.stringify({
        keyword: params.keyword ?? "",
        status: params.status ?? "",
        ordering: params.ordering ?? "",
        pageNum: params.pageNum ?? 1,
        pageSize: params.pageSize ?? 10,
      }),
    [
      params.keyword,
      params.status,
      params.ordering,
      params.pageNum,
      params.pageSize,
    ]
  );

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await listInvoicesRequest(params);
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Failed to fetch invoices";
          setError(message);
          setData(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey, reloadToken]);

  const refetch = React.useCallback(() => {
    setReloadToken((prev) => prev + 1);
  }, []);

  return { data, isLoading, error, refetch };
}