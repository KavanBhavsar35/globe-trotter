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
      <div className="mx-auto w-full max-w-5xl flex-1 p-4 md:p-6">{children}</div>
    </div>
  );
}
