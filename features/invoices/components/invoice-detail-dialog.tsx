import * as React from "react";
import {
  Building2Icon,
  CalendarIcon,
  FileTextIcon,
  HashIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { InvoiceStatusBadge } from "@/features/invoices/components/invoice-status-badge";
import { cn, formatBalance, formatCurrency, formatDate } from "@/shared/utils";
import type { Customer, Invoice, InvoiceItem } from "@/features/invoices/types/invoice.types";

interface InvoiceDetailDialogProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvoiceDetailDialog({
  invoice,
  open,
  onOpenChange,
}: InvoiceDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="max-h-[90vh] max-w-3xl gap-0 overflow-hidden p-0 sm:max-w-3xl"
      >
        {invoice ? <InvoiceDetailContent invoice={invoice} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function InvoiceDetailContent({ invoice }: { invoice: Invoice }) {
  const subtotal = invoice.invoiceSubTotal ?? invoice.amount;
  const tax = invoice.totalTax ?? 0;
  const discount = invoice.totalDiscount ?? 0;
  const total = invoice.totalAmount;
  const paid = invoice.totalPaid ?? 0;
  const balance = invoice.balanceAmount ?? total - paid;
  const isNegativeBalance = balance < 0;

  const customerName =
    invoice.customer?.name ||
    [invoice.customer?.firstName, invoice.customer?.lastName]
      .filter(Boolean)
      .join(" ") ||
    "—";

  return (
    <div className="flex max-h-[90vh] flex-col">
      {/* Header */}
      <DialogHeader className="gap-1 border-b border-[#E2E8F0] px-6 py-5 text-left dark:border-white/10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8] dark:text-white/40">
                Invoice
              </span>
              <span className="text-sm font-semibold text-[#0F172A] dark:text-white">
                {invoice.invoiceNumber}
              </span>
              <InvoiceStatusBadge status={invoice.status} />
            </div>
            <DialogTitle className="text-lg font-semibold text-[#0F172A] dark:text-white">
              {customerName}
            </DialogTitle>
            <DialogDescription className="text-sm text-[#64748B] dark:text-white/60">
              {invoice.description || "No description provided"}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {/* Summary tiles */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryTile
            label="Subtotal"
            value={formatCurrency(subtotal, invoice.currency)}
          />
          <SummaryTile
            label="Tax"
            value={tax > 0 ? formatCurrency(tax, invoice.currency) : "—"}
          />
          <SummaryTile
            label="Total"
            value={formatCurrency(total, invoice.currency)}
            highlight
          />
          <SummaryTile
            label="Balance"
            value={formatBalance(balance, invoice.currency)}
            tone={
              isNegativeBalance
                ? "negative"
                : balance > 0
                  ? "positive"
                  : "neutral"
            }
          />
        </div>

        <div className="my-5" />

        {/* Parties + dates */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <PartyCard
            title="From"
            icon={<Building2Icon className="size-4" />}
            name={invoice.merchant?.name || "—"}
            meta={
              invoice.merchant?.addresses?.length
                ? invoice.merchant.addresses
                    .map((a) =>
                      [a?.addressLine1, a?.city, a?.country]
                        .filter(Boolean)
                        .join(", ")
                    )
                    .filter(Boolean)
                    .join(" · ")
                : null
            }
          />
          <PartyCard
            title="Bill To"
            icon={<UserIcon className="size-4" />}
            name={customerName}
            meta={formatCustomerContact(invoice.customer)}
          />
          <InfoCard
            icon={<CalendarIcon className="size-4" />}
            label="Issue Date"
            value={formatDate(invoice.invoiceDate)}
          />
          <InfoCard
            icon={<CalendarIcon className="size-4" />}
            label="Due Date"
            value={formatDate(invoice.dueDate)}
          />
        </div>

        {/* Reference / meta */}
        {(invoice.invoiceReference ||
          invoice.referenceNo ||
          invoice.type ||
          invoice.version ||
          invoice.currencySymbol) && (
          <>
            <Separator className="my-5" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {invoice.invoiceReference ? (
                <MetaItem
                  icon={<HashIcon className="size-3.5" />}
                  label="Reference"
                  value={invoice.invoiceReference}
                />
              ) : null}
              {invoice.type ? (
                <MetaItem
                  icon={<FileTextIcon className="size-3.5" />}
                  label="Type"
                  value={invoice.type}
                />
              ) : null}
              {invoice.version ? (
                <MetaItem
                  icon={<HashIcon className="size-3.5" />}
                  label="Version"
                  value={invoice.version}
                />
              ) : null}
              {invoice.currency ? (
                <MetaItem
                  icon={<HashIcon className="size-3.5" />}
                  label="Currency"
                  value={`${invoice.currency} ${invoice.currencySymbol ?? ""}`.trim()}
                />
              ) : null}
            </div>
          </>
        )}

        {/* Items */}
        <Separator className="my-5" />
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8] dark:text-white/40">
            Items
          </h3>
          {invoice.items?.length ? (
            <div className="overflow-hidden rounded-lg border border-[#E2E8F0] dark:border-white/10">
              <table className="w-full text-sm">
                <thead className="bg-[#F8FAFC] text-xs uppercase tracking-wide text-[#94A3B8] dark:bg-white/5 dark:text-white/40">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">
                      Item
                    </th>
                    <th className="px-3 py-2 text-right font-semibold">Qty</th>
                    <th className="px-3 py-2 text-right font-semibold">Rate</th>
                    <th className="px-3 py-2 text-right font-semibold">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, idx) => (
                    <ItemRow key={item.id ?? idx} item={item} currency={invoice.currency} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-[#E2E8F0] px-3 py-4 text-center text-sm text-[#94A3B8] dark:border-white/10 dark:text-white/40">
              No items on this invoice.
            </p>
          )}
        </div>

        {/* Totals breakdown */}
        <Separator className="my-5" />
        <div className="flex justify-end">
          <dl className="w-full max-w-xs space-y-2 text-sm">
            <TotalRow
              label="Subtotal"
              value={formatCurrency(subtotal, invoice.currency)}
            />
            {discount > 0 ? (
              <TotalRow
                label="Discount"
                value={`-${formatCurrency(discount, invoice.currency)}`}
                tone="negative"
              />
            ) : null}
            {tax > 0 ? (
              <TotalRow
                label="Tax"
                value={formatCurrency(tax, invoice.currency)}
              />
            ) : null}
            <Separator className="my-1" />
            <TotalRow
              label="Total"
              value={formatCurrency(total, invoice.currency)}
              bold
            />
            {paid > 0 ? (
              <TotalRow
                label="Paid"
                value={formatCurrency(paid, invoice.currency)}
                tone="positive"
              />
            ) : null}
            <TotalRow
              label="Balance Due"
              value={formatBalance(balance, invoice.currency)}
              tone={
                isNegativeBalance
                  ? "negative"
                  : balance > 0
                    ? "positive"
                    : "neutral"
              }
              bold
            />
          </dl>
        </div>

        {/* Custom fields */}
        {invoice.customFields?.length ? (
          <>
            <Separator className="my-5" />
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8] dark:text-white/40">
                Custom Fields
              </h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {invoice.customFields.map((field, idx) => (
                  <div
                    key={`${field.label}-${idx}`}
                    className="flex items-center justify-between rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm dark:border-white/10"
                  >
                    <span className="text-[#64748B] dark:text-white/60">
                      {field.label}
                    </span>
                    <span className="font-medium text-[#0F172A] dark:text-white">
                      {field.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function SummaryTile({
  label,
  value,
  highlight = false,
  tone = "neutral",
}: {
  label: string;
  value: string;
  highlight?: boolean;
  tone?: "neutral" | "positive" | "negative";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-3",
        highlight
          ? "border-[#0F172A] bg-[#0F172A] text-white dark:border-white dark:bg-white dark:text-[#0F172A]"
          : "border-[#E2E8F0] bg-white dark:border-white/10 dark:bg-white/5"
      )}
    >
      <p
        className={cn(
          "text-xs font-semibold uppercase tracking-wide",
          highlight
            ? "text-white/60 dark:text-[#0F172A]/60"
            : "text-[#94A3B8] dark:text-white/40"
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-base font-semibold tabular-nums",
          highlight
            ? "text-white dark:text-[#0F172A]"
            : tone === "negative"
              ? "text-[#EF4444] dark:text-red-400"
              : tone === "positive"
                ? "text-[#22C55E] dark:text-green-400"
                : "text-[#0F172A] dark:text-white"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function PartyCard({
  title,
  icon,
  name,
  meta,
}: {
  title: string;
  icon: React.ReactNode;
  name: string;
  meta: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 dark:border-white/10 dark:bg-white/5">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#94A3B8] dark:text-white/40">
        {icon}
        {title}
      </div>
      <p className="text-sm font-semibold text-[#0F172A] dark:text-white">
        {name}
      </p>
      {meta ? (
        <div className="mt-1 text-xs text-[#64748B] dark:text-white/60">
          {meta}
        </div>
      ) : null}
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 dark:border-white/10 dark:bg-white/5">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#94A3B8] dark:text-white/40">
        {icon}
        {label}
      </div>
      <p className="text-sm font-semibold text-[#0F172A] dark:text-white">
        {value}
      </p>
    </div>
  );
}

function MetaItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm dark:border-white/10">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#94A3B8] dark:text-white/40">
        {icon}
        {label}
      </div>
      <span className="truncate text-sm font-medium text-[#0F172A] dark:text-white">
        {value}
      </span>
    </div>
  );
}

function ItemRow({ item, currency }: { item: InvoiceItem; currency: string }) {
  const qty = item.quantity ?? 0;
  const rate = item.rate ?? 0;
  const amount = item.amount ?? qty * rate;
  return (
    <tr className="border-t border-[#E2E8F0] dark:border-white/10">
      <td className="px-3 py-2 align-top">
        <div className="flex flex-col">
          <span className="font-medium text-[#0F172A] dark:text-white">
            {item.name || "—"}
          </span>
          {item.description ? (
            <span className="text-xs text-[#94A3B8] dark:text-white/40">
              {item.description}
            </span>
          ) : null}
        </div>
      </td>
      <td className="px-3 py-2 text-right tabular-nums text-[#475569] dark:text-white/60">
        {qty}
      </td>
      <td className="px-3 py-2 text-right tabular-nums text-[#475569] dark:text-white/60">
        {formatCurrency(rate, currency)}
      </td>
      <td className="px-3 py-2 text-right tabular-nums font-semibold text-[#0F172A] dark:text-white">
        {formatCurrency(amount, currency)}
      </td>
    </tr>
  );
}

function TotalRow({
  label,
  value,
  bold = false,
  tone = "neutral",
}: {
  label: string;
  value: string;
  bold?: boolean;
  tone?: "neutral" | "positive" | "negative";
}) {
  return (
    <div className="flex items-center justify-between">
      <dt
        className={cn(
          "text-[#64748B] dark:text-white/60",
          bold && "font-semibold text-[#0F172A] dark:text-white"
        )}
      >
        {label}
      </dt>
      <dd
        className={cn(
          "tabular-nums",
          bold && "font-semibold",
          tone === "negative"
            ? "text-[#EF4444] dark:text-red-400"
            : tone === "positive"
              ? "text-[#22C55E] dark:text-green-400"
              : "text-[#0F172A] dark:text-white"
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function formatCustomerContact(customer: Customer | undefined) {
  if (!customer) return null;
  const parts: React.ReactNode[] = [];
  if (customer.email) {
    parts.push(
      <span key="email" className="inline-flex items-center gap-1">
        <MailIcon className="size-3" />
        {customer.email}
      </span>
    );
  }
  if (customer.contact?.phone) {
    parts.push(
      <span key="phone" className="inline-flex items-center gap-1">
        <PhoneIcon className="size-3" />
        {customer.contact.phone}
      </span>
    );
  }
  const address = customer.address;
  if (address) {
    const addr = [address.addressLine1, address.city, address.country]
      .filter(Boolean)
      .join(", ");
    if (addr) {
      parts.push(
        <span key="address" className="inline-flex items-center gap-1">
          <MapPinIcon className="size-3" />
          {addr}
        </span>
      );
    }
  }
  if (!parts.length) return null;
  return <span className="flex flex-wrap gap-x-3 gap-y-1">{parts}</span>;
}

// Suppress unused imports warning for icons referenced above
