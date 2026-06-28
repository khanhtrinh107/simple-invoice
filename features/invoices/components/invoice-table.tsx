import * as React from "react";
import { FileTextIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { InvoiceStatusBadge } from "@/features/invoices/components/invoice-status-badge";
import { InvoiceDetailDialog } from "@/features/invoices/components/invoice-detail-dialog";
import { cn, formatBalance, formatCurrency, formatDate } from "@/shared/utils";
import type { Invoice } from "@/features/invoices/types/invoice.types";

interface InvoiceTableProps {
  invoices: Invoice[];
  isLoading: boolean;
}

export function InvoiceTable({ invoices, isLoading }: InvoiceTableProps) {
  const [selected, setSelected] = React.useState<Invoice | null>(null);
  const [open, setOpen] = React.useState(false);

  const handleSelect = React.useCallback((invoice: Invoice) => {
    setSelected(invoice);
    setOpen(true);
  }, []);

  const handleOpenChange = React.useCallback((next: boolean) => {
    setOpen(next);
    if (!next) {
      // Allow close animation to finish before clearing selection
      window.setTimeout(() => setSelected(null), 200);
    }
  }, []);

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-[#E2E8F0] bg-white font-sans shadow-sm dark:border-white/10 dark:bg-[#1E293B]">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#E2E8F0] dark:border-white/10">
              <TableHead className="w-12 px-4 text-xs font-semibold uppercase tracking-wide text-[#94A3B8] dark:text-white/40">
                #
              </TableHead>
              <TableHead className="px-4 text-xs font-semibold uppercase tracking-wide text-[#94A3B8] dark:text-white/40">
                Invoice #
              </TableHead>
              <TableHead className="px-4 text-xs font-semibold uppercase tracking-wide text-[#94A3B8] dark:text-white/40">
                Customer
              </TableHead>
              <TableHead className="px-4 text-xs font-semibold uppercase tracking-wide text-[#94A3B8] dark:text-white/40">
                Merchant
              </TableHead>
              <TableHead className="px-4 text-xs font-semibold uppercase tracking-wide text-[#94A3B8] dark:text-white/40">
                Issue Date
              </TableHead>
              <TableHead className="px-4 text-xs font-semibold uppercase tracking-wide text-[#94A3B8] dark:text-white/40">
                Due Date
              </TableHead>
              <TableHead className="px-4 text-xs font-semibold uppercase tracking-wide text-[#94A3B8] dark:text-white/40">
                Status
              </TableHead>
              <TableHead className="px-4 text-right text-xs font-semibold uppercase tracking-wide text-[#94A3B8] dark:text-white/40">
                Subtotal
              </TableHead>
              <TableHead className="px-4 text-right text-xs font-semibold uppercase tracking-wide text-[#94A3B8] dark:text-white/40">
                Tax
              </TableHead>
              <TableHead className="px-4 text-right text-xs font-semibold uppercase tracking-wide text-[#94A3B8] dark:text-white/40">
                Total
              </TableHead>
              <TableHead className="px-4 text-right text-xs font-semibold uppercase tracking-wide text-[#94A3B8] dark:text-white/40">
                Paid
              </TableHead>
              <TableHead className="px-4 text-right text-xs font-semibold uppercase tracking-wide text-[#94A3B8] dark:text-white/40">
                Balance
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <InvoiceTableSkeleton />
            ) : invoices.length === 0 ? (
              <InvoiceTableEmpty />
            ) : (
              invoices.map((invoice, index) => (
                <InvoiceRow
                  key={invoice.id || invoice.invoiceNumber}
                  invoice={invoice}
                  rowNum={index + 1}
                  onSelect={handleSelect}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <InvoiceDetailDialog
        invoice={selected}
        open={open}
        onOpenChange={handleOpenChange}
      />
    </>
  );
}

function InvoiceRow({
  invoice,
  rowNum,
  onSelect,
}: {
  invoice: Invoice;
  rowNum: number;
  onSelect: (invoice: Invoice) => void;
}) {
  const subtotal = invoice.invoiceSubTotal ?? invoice.amount;
  const tax = invoice.totalTax ?? 0;
  const discount = invoice.totalDiscount ?? 0;
  const total = invoice.totalAmount;
  const paid = invoice.totalPaid ?? 0;
  const balance = invoice.balanceAmount ?? total - paid;
  const isNegativeBalance = balance < 0;
  const isPositiveBalance = balance > 0;

  const customerName =
    invoice.customer?.name ||
    [invoice.customer?.firstName, invoice.customer?.lastName]
      .filter(Boolean)
      .join(" ") ||
    "—";

  return (
    <TableRow
      onClick={() => onSelect(invoice)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(invoice);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View invoice ${invoice.invoiceNumber}`}
      className="h-[52px] cursor-pointer border-b border-[#F1F5F9] transition-colors hover:bg-[#F8FAFC] focus-visible:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0F172A] dark:border-white/5 dark:hover:bg-white/5 dark:focus-visible:bg-white/5 dark:focus-visible:ring-white [&:last-child]:border-0"
    >
      {/* Row # */}
      <TableCell className="px-4 text-sm font-medium text-[#94A3B8] dark:text-white/40">
        {rowNum}
      </TableCell>

      {/* Invoice # */}
      <TableCell className="px-4">
        <span className="text-sm font-semibold text-[#0F172A] dark:text-white">
          {invoice.invoiceNumber}
        </span>
      </TableCell>

      {/* Customer */}
      <TableCell className="px-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-[#0F172A] dark:text-white">
            {customerName}
          </span>
          {invoice.customer?.email ? (
            <span className="line-clamp-1 text-xs text-[#94A3B8] dark:text-white/40">
              {invoice.customer.email}
            </span>
          ) : null}
        </div>
      </TableCell>

      {/* Merchant */}
      <TableCell className="px-4">
        <span className="text-sm text-[#475569] dark:text-white/60">
          {invoice.merchant?.name || "—"}
        </span>
      </TableCell>

      {/* Issue Date */}
      <TableCell className="px-4">
        <span className="text-sm tabular-nums text-[#475569] dark:text-white/60">
          {formatDate(invoice.invoiceDate)}
        </span>
      </TableCell>

      {/* Due Date */}
      <TableCell className="px-4">
        <span className="text-sm tabular-nums text-[#475569] dark:text-white/60">
          {formatDate(invoice.dueDate)}
        </span>
      </TableCell>

      {/* Status */}
      <TableCell className="px-4">
        <InvoiceStatusBadge status={invoice.status} />
      </TableCell>

      {/* Subtotal */}
      <TableCell className="px-4 text-right">
        <span className="text-sm tabular-nums text-[#475569] dark:text-white/60">
          {formatCurrency(subtotal, invoice.currency)}
        </span>
      </TableCell>

      {/* Tax */}
      <TableCell className="px-4 text-right">
        <span className="text-sm tabular-nums text-[#475569] dark:text-white/60">
          {tax > 0 ? formatCurrency(tax, invoice.currency) : "—"}
        </span>
      </TableCell>

      {/* Total */}
      <TableCell className="px-4 text-right">
        <span className="text-sm font-semibold tabular-nums text-[#0F172A] dark:text-white">
          {formatCurrency(total, invoice.currency)}
        </span>
        {discount > 0 ? (
          <span className="ml-1 text-xs text-[#94A3B8] dark:text-white/40">
            (-{formatCurrency(discount, invoice.currency)})
          </span>
        ) : null}
      </TableCell>

      {/* Paid */}
      <TableCell className="px-4 text-right">
        <span className="text-sm tabular-nums text-[#475569] dark:text-white/60">
          {paid > 0 ? formatCurrency(paid, invoice.currency) : "—"}
        </span>
      </TableCell>

      {/* Balance */}
      <TableCell className="px-4 text-right">
        <span
          className={cn(
            "text-sm tabular-nums",
            isNegativeBalance
              ? "font-semibold text-[#EF4444] dark:text-red-400"
              : isPositiveBalance
                ? "font-semibold text-[#22C55E] dark:text-green-400"
                : "font-normal text-[#94A3B8] dark:text-white/40"
          )}
        >
          {formatBalance(balance, invoice.currency)}
        </span>
      </TableCell>
    </TableRow>
  );
}

function InvoiceTableSkeleton() {
  return (
    <React.Fragment key="skeleton-rows">
      {Array.from({ length: 8 }).map((_, index) => (
        <TableRow
          key={`skeleton-${index}`}
          aria-hidden="true"
          className="h-[52px] border-b border-[#F1F5F9] dark:border-white/5 [&:last-child]:border-0"
        >
          <TableCell className="px-4">
            <Skeleton className="h-3.5 w-4 rounded" />
          </TableCell>
          <TableCell className="px-4">
            <Skeleton className="h-3.5 w-28 rounded" />
          </TableCell>
          <TableCell className="px-4">
            <div className="flex flex-col gap-1">
              <Skeleton className="h-3.5 w-24 rounded" />
              <Skeleton className="h-3 w-32 rounded" />
            </div>
          </TableCell>
          <TableCell className="px-4">
            <Skeleton className="h-3.5 w-20 rounded" />
          </TableCell>
          <TableCell className="px-4">
            <Skeleton className="h-3.5 w-20 rounded" />
          </TableCell>
          <TableCell className="px-4">
            <Skeleton className="h-3.5 w-20 rounded" />
          </TableCell>
          <TableCell className="px-4">
            <Skeleton className="h-6 w-16 rounded-full" />
          </TableCell>
          <TableCell className="px-4 text-right">
            <Skeleton className="ml-auto h-3.5 w-20 rounded" />
          </TableCell>
          <TableCell className="px-4 text-right">
            <Skeleton className="ml-auto h-3.5 w-16 rounded" />
          </TableCell>
          <TableCell className="px-4 text-right">
            <Skeleton className="ml-auto h-3.5 w-20 rounded" />
          </TableCell>
          <TableCell className="px-4 text-right">
            <Skeleton className="ml-auto h-3.5 w-16 rounded" />
          </TableCell>
          <TableCell className="px-4 text-right">
            <Skeleton className="ml-auto h-3.5 w-20 rounded" />
          </TableCell>
        </TableRow>
      ))}
    </React.Fragment>
  );
}

function InvoiceTableEmpty() {
  return (
    <React.Fragment key="empty-row">
      <TableRow>
        <TableCell colSpan={12} className="h-[240px] text-center">
          <div className="mx-auto flex w-full max-w-xs flex-col items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-full bg-[#F1F5F9] dark:bg-white/5">
              <FileTextIcon className="size-5 text-[#94A3B8] dark:text-white/40" />
            </div>
            <p className="text-sm font-semibold text-[#334155] dark:text-white">
              No invoices found
            </p>
            <p className="text-xs text-[#94A3B8] dark:text-white/40">
              Try adjusting your search or filters, or create a new invoice.
            </p>
          </div>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}