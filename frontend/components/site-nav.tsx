"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Globe, UserRound } from "lucide-react";
import { clearSession } from "@/lib/api";
import { useMe } from "@/lib/use-me";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteNav() {
  const router = useRouter();
  const { me } = useMe();

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
          <Link
            href="/profile"
            aria-label="Profile"
            className="ml-1 flex items-center gap-2 rounded-md px-1 py-1 hover:bg-muted"
          >
            {me?.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element -- presigned URL expires; next/image would cache a stale link
              <img
                src={me.photo_url}
                alt=""
                className="size-7 rounded-full object-cover ring-1 ring-border"
              />
            ) : (
              <span className="flex size-7 items-center justify-center rounded-full bg-muted ring-1 ring-border">
                <UserRound className="size-4 text-muted-foreground" />
              </span>
            )}
            {me?.email && (
              <span className="hidden text-muted-foreground md:inline">{me.email}</span>
            )}
          </Link>
          <ThemeToggle />
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="size-4" /> Logout
          </Button>
        </nav>
      </div>
    </header>
  );
}
