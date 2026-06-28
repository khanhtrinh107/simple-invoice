"use client";

import * as React from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { BrandMark } from "@/components/layout/brand-mark";
import { Header } from "@/components/layout/header";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { APP_NAME, ROUTES } from "@/shared/constants";
import { cn } from "@/lib/utils";
import { PanelLeftCloseIcon, PanelLeftOpenIcon, XIcon } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);

  // Auto-close mobile drawer when viewport grows past the md breakpoint.
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(min-width: 768px)");
    const handleChange = () => {
      if (media.matches) {
        setMobileOpen(false);
      }
    };
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  // Lock body scroll while the mobile drawer is open.
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const original = document.body.style.overflow;
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = original;
    };
  }, [mobileOpen]);

  return (
    <div className="flex min-h-svh w-full bg-background text-foreground">
      {/* Desktop sidebar — collapses to icon-only when toggled */}
      <aside
        aria-label="Sidebar"
        className={cn(
          "hidden shrink-0 border-r border-sidebar-border bg-sidebar transition-[width] duration-200 md:flex md:flex-col",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <SidebarBrand
          collapsed={collapsed}
          onToggle={() => setCollapsed((prev) => !prev)}
        />
        <SidebarContent collapsed={collapsed} />
      </aside>

      {/* Mobile drawer */}
      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent
          showCloseButton={false}
          className="fixed inset-y-0 left-0 right-auto z-50 h-full w-72 max-w-[85vw] translate-x-0 translate-y-0 gap-0 rounded-none rounded-r-xl p-0"
        >
          <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-3">
            <DialogTitle className="text-sm font-semibold tracking-tight">
              {APP_NAME}
            </DialogTitle>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
              className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <XIcon className="size-4" />
            </button>
          </div>
          <SidebarContent
            className="p-3"
            onNavigate={() => setMobileOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          showMenuButton
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8 md:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

function SidebarBrand({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        "flex h-14 shrink-0 items-center border-b border-sidebar-border",
        collapsed ? "justify-center px-2" : "justify-between px-4"
      )}
    >
      <Link
        href={ROUTES.INVOICES}
        aria-label={`${APP_NAME} home`}
        className={cn(
          "flex items-center overflow-hidden transition-[max-width,opacity] duration-200",
          collapsed ? "max-w-0 opacity-0 pointer-events-none" : "max-w-full opacity-100"
        )}
      >
        <BrandMark variant="dark" className="h-7" />
      </Link>
      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-pressed={collapsed}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        {collapsed ? (
          <PanelLeftOpenIcon className="size-4" />
        ) : (
          <PanelLeftCloseIcon className="size-4" />
        )}
      </button>
    </div>
  );
}

interface SidebarContentProps {
  className?: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}

function SidebarContent({ className, collapsed, onNavigate }: SidebarContentProps) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col gap-6 overflow-y-auto",
        collapsed ? "p-2" : "p-4",
        className
      )}
    >
      <SidebarNav collapsed={collapsed} onNavigate={onNavigate} />
    </div>
  );
}