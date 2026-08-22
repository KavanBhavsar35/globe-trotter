"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Globe, LogOut } from "lucide-react";
import { getEmail, clearSession } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteNav() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => setEmail(getEmail()), []);

  function logout() {
    clearSession();
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between p-3 md:px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-lg font-heading font-bold tracking-tight"
        >
          <Globe className="size-5 text-primary" /> GlobeTrotter
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/dashboard" className="rounded-md px-2.5 py-1.5 hover:bg-muted">
            Dashboard
          </Link>
          <Link href="/trips" className="rounded-md px-2.5 py-1.5 hover:bg-muted">
            My Trips
          </Link>
          {email && (
            <span className="hidden px-2 text-muted-foreground md:inline">{email}</span>
          )}
          <ThemeToggle />
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="size-4" /> Logout
          </Button>
        </nav>
      </div>
    </header>
  );
}
