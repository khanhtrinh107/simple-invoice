import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center rounded-[10px] border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-all outline-none select-none focus-visible:ring-3 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[#1256E6] text-white hover:bg-[#1D4ED8] focus-visible:ring-[#1256E6]/40 active:bg-[#1E40AF]",
        "default-outline":
          "border border-[#E2E8F0] bg-white text-[#334155] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] focus-visible:ring-[#1256E6]/20 active:bg-[#F1F5F9] dark:border-[#334155] dark:bg-[#1E293B] dark:text-white dark:hover:bg-[#334155]",
        gradient:
          "border-0 bg-gradient-to-r from-[#1256E6] to-[#2563EB] text-white shadow-sm hover:from-[#1D4ED8] hover:to-[#1E40AF] hover:shadow-md focus-visible:ring-[#1256E6]/40 active:from-[#1E40AF] active:to-[#1D4ED8]",
        outline:
          "border border-[#E2E8F0] bg-white text-[#334155] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] aria-expanded:bg-[#F8FAFC] aria-expanded:text-[#334155] dark:border-[#334155] dark:bg-[#1E293B] dark:text-white dark:hover:bg-[#334155]",
        secondary:
          "bg-[#F1F5F9] text-[#334155] hover:bg-[#E2E8F0] aria-expanded:bg-[#E2E8F0] aria-expanded:text-[#334155] dark:bg-[#334155] dark:text-white dark:hover:bg-[#475569] dark:aria-expanded:bg-[#475569]",
        ghost:
          "hover:bg-[#F1F5F9] hover:text-[#334155] aria-expanded:bg-[#F1F5F9] aria-expanded:text-[#334155] dark:hover:bg-[#334155] dark:hover:text-white dark:aria-expanded:bg-[#334155] dark:aria-expanded:text-white",
        destructive:
          "bg-[#FEE2E2] text-[#DC2626] hover:bg-[#FECACA] focus-visible:border-[#DC2626]/40 focus-visible:ring-[#DC2626]/20 dark:bg-[#7F1D1D] dark:text-[#FCA5A5] dark:hover:bg-[#991B1B]",
        link: "text-[#1256E6] underline-offset-4 hover:underline dark:text-[#60A5FA]",
      },
      size: {
        default:
          "h-12 gap-2 px-5 has-data-[icon=inline-end]:pr-3.5 has-data-[icon=inline-start]:pl-3.5",
        xs:
          "h-7 gap-1.5 rounded-[10px] px-2.5 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        sm: "h-9 gap-1.5 rounded-[10px] px-3 text-xs has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        lg: "h-12 gap-2 px-6 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4 text-base",
        xl: "h-14 gap-2.5 px-7 has-data-[icon=inline-end]:pr-4.5 has-data-[icon=inline-start]:pl-4.5 text-base",
        icon: "size-12",
        "icon-xs": "size-7 rounded-[10px]",
        "icon-sm": "size-9 rounded-[10px]",
        "icon-lg": "size-12 rounded-[10px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
