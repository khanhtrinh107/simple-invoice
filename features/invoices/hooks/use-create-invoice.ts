"use client";

import * as React from "react";
import type {
  CreateInvoicePayload,
  CreateInvoiceResponse,
} from "@/features/invoices/types/invoice.types";
import { createInvoiceRequest } from "@/features/invoices/api/invoice-client";

interface UseCreateInvoiceState {
  isLoading: boolean;
  error: string | null;
  create: (payload: CreateInvoicePayload) => Promise<CreateInvoiceResponse>;
}

export function useCreateInvoice(): UseCreateInvoiceState {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const create = React.useCallback(
    async (payload: CreateInvoicePayload): Promise<CreateInvoiceResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await createInvoiceRequest(payload);
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create invoice";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { isLoading, error, create };
}
