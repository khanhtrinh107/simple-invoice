import * as React from "react";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
  /** "light" for dark backgrounds, "dark" for light backgrounds */
  variant?: "light" | "dark";
}

/**
 * SimpleInvoice brand mark — two interlocking arcs forming an "S" gesture,
 * echoing the 101 Digital style of overlapping geometric shapes in a
 * brand blue → orange gradient.
 */
export function BrandMark({ className, variant = "dark" }: BrandMarkProps) {
  const wordColor = variant === "light" ? "#ffffff" : "#0f172a";

  return (
    <svg
      viewBox="0 0 220 44"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("h-8 w-auto shrink-0", className)}
      fill="none"
    >
      <defs>
        <linearGradient id="si-mark-a" x1="4" y1="40" x2="40" y2="4" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#1256E6" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient id="si-mark-b" x1="40" y1="4" x2="4" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFB110" />
          <stop offset="1" stopColor="#F97316" />
        </linearGradient>
      </defs>

      {/* Two interlocking arcs — the "SI" mark */}
      {/* Back arc (blue) — opens to the right */}
      <path
        d="M 22 38 A 18 18 0 1 1 22 6"
        stroke="url(#si-mark-a)"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      {/* Front arc (orange) — opens to the left, interlocks with back arc */}
      <path
        d="M 22 6 A 18 18 0 1 1 22 38"
        stroke="url(#si-mark-b)"
        strokeWidth="4.5"
        strokeLinecap="round"
        opacity="0.92"
      />

      {/* Wordmark */}
      <text
        x="52"
        y="29"
        fill={wordColor}
        fontFamily="var(--font-heading), system-ui, sans-serif"
        fontSize="20"
        fontWeight="600"
        letterSpacing="-0.4"
      >
        SimpleInvoice
      </text>
    </svg>
  );
}