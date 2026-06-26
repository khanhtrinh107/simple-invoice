"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileTextIcon, PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/shared/constants";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Invoices", href: ROUTES.INVOICES, icon: FileTextIcon },
  { label: "Create Invoice", href: ROUTES.CREATE_INVOICE, icon: PlusIcon },
];

interface SidebarNavProps {
  className?: string;
  onNavigate?: () => void;
}

export function SidebarNav({ className, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      className={cn("flex flex-col gap-1", className)}
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/" && pathname?.startsWith(`${item.href}/`));

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group flex items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium transition-colors outline-none",
              "focus-visible:ring-2 focus-visible:ring-ring/50",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon
              className={cn(
                "size-4 shrink-0",
                isActive
                  ? "text-sidebar-primary"
                  : "text-muted-foreground group-hover:text-sidebar-accent-foreground"
              )}
            />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}