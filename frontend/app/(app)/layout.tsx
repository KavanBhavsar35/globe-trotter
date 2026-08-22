"use client";

import type { ReactNode } from "react";
import { useRequireAuth } from "@/lib/auth";
import { SiteNav } from "@/components/site-nav";

export default function AppLayout({ children }: { children: ReactNode }) {
  const ready = useRequireAuth();
  if (!ready) {
    return (
      <div className="flex min-h-svh items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }
  return (
    <div className="flex min-h-svh flex-col">
      <SiteNav />
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-6 md:py-10">{children}</div>
    </div>
  );
}
