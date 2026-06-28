"use client";

import * as React from "react";
import { installFetchInterceptor } from "@/lib/fetch-interceptor";

/**
 * Mounts the global 401 → /login fetch interceptor. Rendered once at the
 * root of the tree; effect runs once on the client after hydration.
 */
export function FetchInterceptorInstaller(): null {
  React.useEffect(() => {
    installFetchInterceptor();
  }, []);
  return null;
}