import * as React from "react";

/**
 * Decorative currency / wallet illustration for the login hero panel.
 * Rendered as faint, low-opacity line-art so it reads as a subtle backdrop.
 */
export function LoginHeroArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 600"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Outer wallet body */}
      <rect x="120" y="180" width="360" height="240" rx="22" />
      <rect x="120" y="180" width="360" height="240" rx="22" opacity="0.45" />

      {/* Wallet flap */}
      <path d="M120 180 L300 110 L480 180" opacity="0.85" />
      <path d="M170 180 L300 130 L430 180" opacity="0.55" />

      {/* Card slot */}
      <rect x="170" y="290" width="260" height="60" rx="10" opacity="0.7" />
      <line x1="200" y1="320" x2="260" y2="320" opacity="0.7" />
      <line x1="200" y1="335" x2="240" y2="335" opacity="0.55" />

      {/* Stitching */}
      <path d="M140 200 L140 400" strokeDasharray="4 6" opacity="0.45" />
      <path d="M460 200 L460 400" strokeDasharray="4 6" opacity="0.45" />

      {/* Clasp */}
      <circle cx="300" cy="400" r="10" />
      <circle cx="300" cy="400" r="3" fill="currentColor" opacity="0.85" />

      {/* Floating coins */}
      <g opacity="0.75">
        <circle cx="80" cy="120" r="26" />
        <circle cx="80" cy="120" r="18" opacity="0.55" />
        <text
          x="80"
          y="128"
          textAnchor="middle"
          fontSize="22"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontWeight="600"
          stroke="none"
          fill="currentColor"
          opacity="0.85"
        >
          $
        </text>
      </g>

      <g opacity="0.7">
        <circle cx="520" cy="150" r="22" />
        <text
          x="520"
          y="158"
          textAnchor="middle"
          fontSize="20"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontWeight="600"
          stroke="none"
          fill="currentColor"
          opacity="0.85"
        >
          €
        </text>
      </g>

      <g opacity="0.7">
        <circle cx="540" cy="470" r="18" />
        <text
          x="540"
          y="476"
          textAnchor="middle"
          fontSize="16"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontWeight="600"
          stroke="none"
          fill="currentColor"
          opacity="0.85"
        >
          ¥
        </text>
      </g>

      <g opacity="0.6">
        <circle cx="60" cy="430" r="14" />
      </g>

      {/* Floating banknotes */}
      <g opacity="0.7" transform="rotate(-12 80 480)">
        <rect x="40" y="460" width="90" height="44" rx="6" />
        <circle cx="85" cy="482" r="10" opacity="0.7" />
      </g>

      <g opacity="0.55" transform="rotate(15 510 360)">
        <rect x="470" y="340" width="90" height="44" rx="6" />
        <circle cx="515" cy="362" r="10" opacity="0.7" />
      </g>

      {/* Decorative sparkles */}
      <g opacity="0.5">
        <path d="M150 80 L150 100 M140 90 L160 90" />
        <path d="M450 510 L450 526 M442 518 L458 518" />
        <path d="M380 80 L380 94 M373 87 L387 87" />
      </g>
    </svg>
  );
}