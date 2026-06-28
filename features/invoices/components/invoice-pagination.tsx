"use client";

import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PAGE_SIZE_OPTIONS } from "@/shared/constants";

interface InvoicePaginationProps {
  pageNum: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (pageNum: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function InvoicePagination({
  pageNum,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: InvoicePaginationProps) {
  const safeTotalPages = Math.max(totalPages, 1);
  const hasPrev = pageNum > 1;
  const hasNext = pageNum < safeTotalPages;

  const rangeStart = total === 0 ? 0 : (pageNum - 1) * pageSize + 1;
  const rangeEnd = Math.min(pageNum * pageSize, total);

  return (
    <div className="flex items-center justify-between gap-4">
      {/* Left: range text */}
      <p className="text-sm font-medium text-[#64748B] dark:text-white/60">
        {total === 0
          ? "0 of 0"
          : `${rangeStart}-${rangeEnd} of ${total}`}
      </p>

      {/* Right: rows-per-page + pagination */}
      <div className="flex items-center gap-4">
        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#64748B] dark:text-white/60">
            Rows per page
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
          <SelectTrigger
            aria-label="Rows per page"
            className="h-8 w-16 justify-between rounded-lg border border-[#E2E8F0] bg-white px-2 py-1 text-sm font-medium text-[#334155] shadow-sm hover:border-[#CBD5E1] hover:bg-[#F8FAFC] focus-visible:border-[#1256E6] focus-visible:ring-[3px] focus-visible:ring-[#1256E6]/15 active:translate-y-0 dark:border-white/15 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/[0.10] dark:hover:border-white/25 dark:focus-visible:border-white/40 dark:focus-visible:ring-white/15 dark:active:bg-white/[0.08]"
          >
            <SelectValue />
          </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(pageNum - 1)}
            disabled={!hasPrev}
            aria-label="Previous page"
            className="rounded-lg shadow-sm focus-visible:ring-[#1256E6]/15 focus-visible:border-[#1256E6] focus-visible:ring-[3px] active:translate-y-0 dark:hover:bg-white/[0.10] dark:hover:border-white/25 dark:focus-visible:border-white/40 dark:focus-visible:ring-white/15 dark:active:bg-white/[0.08]"
          >
            <ChevronLeftIcon />
          </Button>
          <span className="min-w-[52px] text-center text-sm font-medium text-[#334155] dark:text-white">
            {pageNum}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(pageNum + 1)}
            disabled={!hasNext}
            aria-label="Next page"
            className="rounded-lg shadow-sm focus-visible:ring-[#1256E6]/15 focus-visible:border-[#1256E6] focus-visible:ring-[3px] active:translate-y-0 dark:hover:bg-white/[0.10] dark:hover:border-white/25 dark:focus-visible:border-white/40 dark:focus-visible:ring-white/15 dark:active:bg-white/[0.08]"
          >
            <ChevronRightIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}
