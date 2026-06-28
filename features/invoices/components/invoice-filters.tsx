"use client";

import * as React from "react";
import { SearchIcon, XIcon, FilterIcon, SortDescIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INVOICE_STATUS_LABELS } from "@/shared/constants";
import type {
  InvoiceStatus,
  SortOrder,
} from "@/features/invoices/types/invoice.types";

const ALL_VALUE = "__all__";

const STATUS_OPTIONS: InvoiceStatus[] = [
  "Due",
  "Overdue",
  "Paid",
  "Cancelled",
  "Rejected",
];

const SORT_ORDER_LABELS: Record<SortOrder, string> = {
  DESCENDING: "Newest first",
  ASCENDING: "Oldest first",
};

interface InvoiceFiltersProps {
  keyword: string;
  status: InvoiceStatus | null;
  ordering: SortOrder;
  resetSignal: number;
  onKeywordChange: (value: string) => void;
  onStatusChange: (value: InvoiceStatus | null) => void;
  onOrderingChange: (value: SortOrder) => void;
  onReset: () => void;
}

export function InvoiceFilters({
  keyword,
  status,
  ordering,
  resetSignal,
  onKeywordChange,
  onStatusChange,
  onOrderingChange,
  onReset,
}: InvoiceFiltersProps) {
  interface LocalKeywordState {
  value: string;
  lastSynced: string;
}

type LocalKeywordAction =
  | { type: "input"; value: string }
  | { type: "sync"; fromParent: string };

function localKeywordReducer(
  state: LocalKeywordState,
  action: LocalKeywordAction
): LocalKeywordState {
  switch (action.type) {
    case "input":
      if (action.value === state.value) return state;
      return { ...state, value: action.value };
    case "sync":
      if (action.fromParent === state.lastSynced) return state;
      return { value: action.fromParent, lastSynced: action.fromParent };
    default:
      return state;
  }
}

const [localKeywordState, dispatchLocalKeyword] = React.useReducer(
  localKeywordReducer,
  { value: keyword, lastSynced: keyword }
);
const localKeyword = localKeywordState.value;

React.useEffect(() => {
  dispatchLocalKeyword({ type: "sync", fromParent: keyword });
}, [keyword, resetSignal]);

// Debounced push to the URL so we don't refetch on every keystroke.
React.useEffect(() => {
  if (localKeyword === keyword) return;
  const handle = window.setTimeout(() => {
    onKeywordChange(localKeyword.trim());
  }, 300);
  return () => window.clearTimeout(handle);
}, [localKeyword, keyword, onKeywordChange]);

  const hasActiveFilters =
    Boolean(keyword) || status !== null || ordering !== "DESCENDING";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Search — full width on mobile, auto on desktop */}
      <div className="relative w-full sm:max-w-xs sm:flex-1">
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" />
        <Input
          type="search"
          inputMode="search"
          value={localKeyword}
          onChange={(event) =>
            dispatchLocalKeyword({ type: "input", value: event.target.value })
          }
          placeholder="Search"
          aria-label="Search invoices"
          className="h-10 pl-9 pr-9 text-sm [&&]:h-10"
        />
        {localKeyword && (
          <button
            type="button"
            onClick={() => {
              dispatchLocalKeyword({ type: "input", value: "" });
              onKeywordChange("");
            }}
            className="pointer-events-auto absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] dark:hover:text-white"
            aria-label="Clear search"
          >
            <XIcon className="size-3.5" />
          </button>
        )}
      </div>

      {/* Action group: filter dropdown + sort dropdown + Add Invoice */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status filter — inline dropdown with icon trigger */}
        <Select
          value={status ?? ALL_VALUE}
          onValueChange={(value) => {
            if (value === ALL_VALUE) {
              onStatusChange(null);
              return;
            }
            onStatusChange(value as InvoiceStatus);
          }}
        >
          <SelectTrigger
            aria-label="Filter by status"
            className="h-10 w-auto gap-2 rounded-[10px] border border-[#E2E8F0] bg-white px-3 text-sm font-medium text-[#334155] shadow-sm hover:border-[#CBD5E1] hover:bg-[#F8FAFC] focus-visible:border-[#1256E6] focus-visible:ring-[3px] focus-visible:ring-[#1256E6]/15 active:translate-y-0 dark:border-white/15 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/[0.10] dark:hover:border-white/25 dark:focus-visible:border-white/40 dark:focus-visible:ring-white/15 dark:active:bg-white/[0.08]"
          >
            <FilterIcon className="size-4 text-[#64748B]" />
            <SelectValue>
              {(value: string | null) =>
                value === null || value === ALL_VALUE
                  ? "All statuses"
                  : (INVOICE_STATUS_LABELS[value as InvoiceStatus] ?? "All statuses")
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All statuses</SelectItem>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {INVOICE_STATUS_LABELS[option]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort — inline dropdown with icon trigger */}
        <Select
          value={ordering}
          onValueChange={(value) => onOrderingChange(value as SortOrder)}
        >
          <SelectTrigger
            aria-label="Sort by date"
            className="h-10 w-auto gap-2 rounded-[10px] border border-[#E2E8F0] bg-white px-3 text-sm font-medium text-[#334155] shadow-sm hover:border-[#CBD5E1] hover:bg-[#F8FAFC] focus-visible:border-[#1256E6] focus-visible:ring-[3px] focus-visible:ring-[#1256E6]/15 active:translate-y-0 dark:border-white/15 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/[0.10] dark:hover:border-white/25 dark:focus-visible:border-white/40 dark:focus-visible:ring-white/15 dark:active:bg-white/[0.08]"
          >
            <SortDescIcon className="size-4 text-[#64748B]" />
            <SelectValue>
              {(value: SortOrder | null) =>
                value ? SORT_ORDER_LABELS[value] : "Newest first"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DESCENDING">Newest first</SelectItem>
            <SelectItem value="ASCENDING">Oldest first</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-10 gap-1.5 rounded-[10px] border border-transparent px-3 text-sm font-medium text-[#64748B] hover:border-[#E2E8F0] hover:bg-[#F8FAFC] hover:text-[#334155] dark:text-white/60 dark:hover:border-white/15 dark:hover:bg-white/[0.06] dark:hover:text-white"
          >
            <XIcon className="size-3.5" />
            Reset
          </Button>
        ) : null}
      </div>
    </div>
  );
}
