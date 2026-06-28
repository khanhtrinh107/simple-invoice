import { InvoiceListView } from "@/features/invoices/components/invoice-list-view";
import { DEFAULT_PAGE_SIZE } from "@/shared/constants";
import type {
  InvoiceStatus,
  SortOrder,
} from "@/features/invoices/types/invoice.types";

const VALID_STATUSES = new Set<InvoiceStatus>([
  "Due",
  "Overdue",
  "Paid",
  "Cancelled",
  "Rejected",
]);

const VALID_SORT_ORDERS = new Set<SortOrder>(["ASCENDING", "DESCENDING"]);

interface InvoicesPageProps {
  searchParams: Promise<{
    keyword?: string;
    status?: string;
    ordering?: string;
    pageNum?: string;
    pageSize?: string;
  }>;
}

export default async function InvoicesPage({ searchParams }: InvoicesPageProps) {
  const params = await searchParams;

  const keyword = (params.keyword ?? "").trim();

  const rawStatus = params.status;
  const status: InvoiceStatus | null =
    rawStatus && VALID_STATUSES.has(rawStatus as InvoiceStatus)
      ? (rawStatus as InvoiceStatus)
      : null;

  const rawOrdering = params.ordering;
  const ordering: SortOrder =
    rawOrdering && VALID_SORT_ORDERS.has(rawOrdering as SortOrder)
      ? (rawOrdering as SortOrder)
      : "DESCENDING";

  const rawPageNum = Number.parseInt(params.pageNum ?? "1", 10);
  const pageNum =
    Number.isFinite(rawPageNum) && rawPageNum > 0 ? rawPageNum : 1;

  const rawPageSize = Number.parseInt(
    params.pageSize ?? String(DEFAULT_PAGE_SIZE),
    10
  );
  const pageSize =
    Number.isFinite(rawPageSize) && rawPageSize > 0
      ? rawPageSize
      : DEFAULT_PAGE_SIZE;

  return (
    <InvoiceListView
      keyword={keyword}
      status={status}
      ordering={ordering}
      pageNum={pageNum}
      pageSize={pageSize}
    />
  );
}