"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOutIcon, UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function getInitials(firstName: string, lastName: string): string {
  const first = firstName?.trim()?.charAt(0) ?? "";
  const last = lastName?.trim()?.charAt(0) ?? "";
  const combined = `${first}${last}`.trim();
  return combined ? combined.toUpperCase() : "U";
}

function getDisplayName(
  firstName: string,
  lastName: string,
  username: string
): string {
  const full = `${firstName ?? ""} ${lastName ?? ""}`.trim();
  return full || username;
}

interface HeaderUserMenuProps {
  className?: string;
}

function HeaderUserMenu({ className }: HeaderUserMenuProps) {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Skeleton className="size-8 shrink-0 rounded-full" />
        <Skeleton className="hidden h-4 w-24 sm:block" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const displayName = getDisplayName(
    user.firstName,
    user.lastName,
    user.username
  );
  const initials = getInitials(user.firstName, user.lastName);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "group flex shrink-0 items-center gap-2 rounded-md px-1 py-1 outline-none",
          "focus-visible:ring-2 focus-visible:ring-ring/50",
          "data-[popup-open]:bg-sidebar-accent data-[popup-open]:text-sidebar-accent-foreground",
          className
        )}
        aria-label="User menu"
      >
        <Avatar size="default">
          {user.avatarUrl ? (
            <AvatarImage src={user.avatarUrl} alt={displayName} />
          ) : null}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <span className="hidden text-sm font-medium text-foreground sm:inline">
          {displayName}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className="min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">
              {displayName}
            </span>
            <span className="text-xs font-normal text-muted-foreground">
              {user.email}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            <UserIcon />
            <span>Profile</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem variant="destructive" onClick={() => void logout()}>
            <LogOutIcon />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface HeaderProps {
  className?: string;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export function Header({
  className,
  onMenuClick,
  showMenuButton = false,
}: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 w-full min-w-0 items-center justify-between gap-2 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6",
        className
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {showMenuButton ? (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 md:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>
        ) : null}
      </div>
      <HeaderUserMenu />
    </header>
  );
}