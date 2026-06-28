"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AlertCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InvoiceFilters } from "@/features/invoices/components/invoice-filters";
import { InvoiceTable } from "@/features/invoices/components/invoice-table";
import { InvoicePagination } from "@/features/invoices/components/invoice-pagination";
import { useInvoices } from "@/features/invoices/hooks/use-invoices";
import { ROUTES } from "@/shared/constants";
import type {
  InvoiceListParams,
  InvoiceStatus,
  SortOrder,
} from "@/features/invoices/types/invoice.types";

interface InvoiceListViewProps {
  keyword: string;
  status: InvoiceStatus | null;
  ordering: SortOrder;
  pageNum: number;
  pageSize: number;
}

export function InvoiceListView({
  keyword,
  status,
  ordering,
  pageNum,
  pageSize,
}: InvoiceListViewProps) {
  const router = useRouter();
  const pathname = usePathname();

  const listParams = React.useMemo<InvoiceListParams>(
    () => ({
      keyword: keyword || undefined,
      status: status ?? undefined,
      ordering,
      pageNum,
      pageSize,
    }),
    [keyword, status, ordering, pageNum, pageSize]
  );

  const { data, isLoading, error } = useInvoices(listParams);

  const [resetSignal, setResetSignal] = React.useState<number>(0);

  const updateSearch = React.useCallback(
    (mutator: (params: URLSearchParams) => void) => {
      const next = new URLSearchParams(window.location.search);
      mutator(next);
      const qs = next.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router]
  );

  const handleKeywordChange = React.useCallback(
    (value: string) => {
      updateSearch((params) => {
        if (value) params.set("keyword", value);
        params.set("pageNum", "1");
      });
    },
    [updateSearch]
  );

  const handleStatusChange = React.useCallback(
    (value: InvoiceStatus | null) => {
      updateSearch((params) => {
        if (value) {
          params.set("status", value);
        } else {
          params.delete("status");
        }
        params.set("pageNum", "1");
      });
    },
    [updateSearch]
  );

  const handleOrderingChange = React.useCallback(
    (value: SortOrder) => {
      updateSearch((params) => {
        params.set("ordering", value);
        params.set("pageNum", "1");
      });
    },
    [updateSearch]
  );

  const handlePageChange = React.useCallback(
    (next: number) => {
      updateSearch((params) => {
        if (next <= 1) {
          params.delete("pageNum");
        } else {
          params.set("pageNum", String(next));
        }
      });
    },
    [updateSearch]
  );

  const handlePageSizeChange = React.useCallback(
    (next: number) => {
      updateSearch((params) => {
        params.set("pageSize", String(next));
        params.delete("pageNum");
      });
    },
    [updateSearch]
  );

  const handleReset = React.useCallback(() => {
    setResetSignal((prev) => prev + 1);
    router.push(pathname, { scroll: false });
  }, [pathname, router]);

  const invoices = data?.data ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Page header: title + Add Invoice CTA */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#0F172A] dark:text-white">
            Invoices
          </h1>
          <p className="mt-0.5 text-sm text-[#64748B] dark:text-white/60">
            Browse, search, and manage all of your invoices.
          </p>
        </div>
        <Button
          size="sm"
          nativeButton={false}
          render={<Link href={ROUTES.CREATE_INVOICE} />}
        >
          Add Invoice
        </Button>
      </div>

      {/* Filters bar: search + filter/sort dropdowns */}
      <InvoiceFilters
        keyword={keyword}
        status={status}
        ordering={ordering}
        resetSignal={resetSignal}
        onKeywordChange={handleKeywordChange}
        onStatusChange={handleStatusChange}
        onOrderingChange={handleOrderingChange}
        onReset={handleReset}
      />

      {/* Error state */}
      {error ? (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Could not load invoices</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {/* Table */}
      <InvoiceTable invoices={invoices} isLoading={isLoading && !data} />

      {/* Pagination */}
      {total > 0 && (
        <InvoicePagination
          pageNum={pageNum}
          pageSize={pageSize}
          total={total}
          totalPages={data?.totalPages ?? 1}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
}
