import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        // Base styles — h-12 (48px), rounded-[10px], font Poppins 14px
        "h-12 w-full min-w-0 rounded-[10px] border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] transition-all outline-none font-heading",
        // Placeholder
        "placeholder:text-[#94A3B8]",
        // Focus
        "focus-visible:border-[#1256E6] focus-visible:ring-3 focus-visible:ring-[#1256E6]/15 focus-visible:outline-none",
        // Disabled
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#F8FAFC]",
        // Error
        "aria-invalid:border-[#EF4444] aria-invalid:ring-3 aria-invalid:ring-[#EF4444]/15",
        // Dark mode (theme + mobile hero)
        "dark:border-white/15 dark:bg-white/[0.06] dark:text-white dark:placeholder:text-white/40 dark:focus-visible:border-white/40 dark:focus-visible:ring-white/15 dark:disabled:bg-white/[0.04]",
        // File
        "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Input }