import { INVOICE_STATUS_LABELS } from "@/shared/constants";
import { cn } from "@/shared/utils";
import type { InvoiceStatus, StatusObject } from "@/features/invoices/types/invoice.types";

type StatusStyleKey = InvoiceStatus | "Open" | "Unknown";

const STATUS_STYLES: Record<
  StatusStyleKey,
  { bg: string; text: string; dot: string }
> = {
  // Open — purple (newly created invoice awaiting action)
  Open: {
    bg: "bg-violet-50 dark:bg-violet-950",
    text: "text-violet-700 dark:text-violet-300",
    dot: "bg-violet-500",
  },
  // Due — blue (payment pending, within due date)
  Due: {
    bg: "bg-blue-50 dark:bg-blue-950",
    text: "text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  // Overdue — red (past due date, needs immediate attention)
  Overdue: {
    bg: "bg-red-50 dark:bg-red-950",
    text: "text-red-700 dark:text-red-300",
    dot: "bg-red-500",
  },
  // Paid — green (payment received, settled)
  Paid: {
    bg: "bg-green-50 dark:bg-green-950",
    text: "text-green-700 dark:text-green-300",
    dot: "bg-green-500",
  },
  // Cancelled — neutral gray
  Cancelled: {
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-500 dark:text-gray-400",
    dot: "bg-gray-400",
  },
  // Rejected — warm gray-red
  Rejected: {
    bg: "bg-stone-100 dark:bg-stone-800",
    text: "text-stone-500 dark:text-stone-400",
    dot: "bg-stone-400",
  },
  // Fallback — muted gray
  Unknown: {
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-500 dark:text-gray-400",
    dot: "bg-gray-400",
  },
};

/**
 * Map the 5 canonical statuses to the 4 visual statuses in the design.
 * "Open" and "Due" both use the pink/Due style in Figma.
 * "Cancelled", "Rejected" use the gray style.
 */
function resolveStatus(
  status: StatusObject[] | StatusObject | InvoiceStatus | string | null | undefined
): { key: string; label: string } {
  if (status === null || status === undefined) {
    return { key: "Unknown", label: "Unknown" };
  }

  let resolvedKey: string;

  // Array form: [{ key: "Due", value: true }]
  if (Array.isArray(status)) {
    if (status.length === 0) {
      return { key: "Unknown", label: "Unknown" };
    }
    const first = status[0];
    resolvedKey = String(first?.key ?? "Unknown");
  } else if (typeof status === "object") {
    resolvedKey = String((status as StatusObject).key ?? "Unknown");
  } else {
    resolvedKey = String(status);
  }

  // Normalize unknown/invalid keys to "Unknown" for safe lookups
  const displayKey =
    resolvedKey === "Unknown" || resolvedKey === "UNKNOWN" || !resolvedKey
      ? "Unknown"
      : resolvedKey;

  const label = INVOICE_STATUS_LABELS[resolvedKey] ?? resolvedKey;
  return { key: displayKey, label };
}

interface InvoiceStatusBadgeProps {
  status: StatusObject[] | StatusObject | InvoiceStatus | string | null | undefined;
}

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const { key, label } = resolveStatus(status);
  const style = STATUS_STYLES[key as StatusStyleKey] ?? STATUS_STYLES.Unknown;

  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-4xl border border-transparent px-2.5 text-xs font-medium",
        style.bg,
        style.text
      )}
      aria-label={`Status: ${label}`}
    >
      {style.dot && (
        <span
          className={cn("size-1.5 shrink-0 rounded-full", style.dot)}
          aria-hidden="true"
        />
      )}
      {label}
    </span>
  );
}