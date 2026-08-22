"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Compass, UserRound } from "lucide-react";
import { clearSession } from "@/lib/api";
import { useMe } from "@/lib/use-me";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

export function SiteNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { me } = useMe();

  function logout() {
    clearSession();
    router.replace("/login");
  }

  const navLinks = [
    { href: "/dashboard", label: "Discover" },
    { href: "/trips", label: "My Trips" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 md:px-6">
        {/* Brand */}
        <Link
          href="/dashboard"
          className="group flex items-center gap-2.5 text-xl font-heading font-bold tracking-tight transition-colors hover:text-primary"
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
            <Compass className="size-5 text-primary" />
          </div>
          <span className="hidden sm:inline">GlobeTrotter</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          {/* Main nav links */}
          <div className="flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || 
                (link.href === "/trips" && pathname?.startsWith("/trips"));
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative px-3 py-1.5 text-sm font-medium transition-colors",
                    "hover:text-foreground",
                    isActive 
                      ? "text-foreground" 
                      : "text-muted-foreground"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute inset-x-3 -bottom-[17px] h-0.5 bg-primary" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Divider */}
          <div className="hidden h-5 w-px bg-border sm:block" />

          {/* Profile & actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/profile"
              aria-label="Profile"
              className="flex items-center gap-2 rounded-full transition-opacity hover:opacity-80"
            >
              {me?.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element -- presigned URL expires; next/image would cache a stale link
                <img
                  src={me.photo_url}
                  alt=""
                  className="size-8 rounded-full object-cover ring-2 ring-border transition-all hover:ring-primary/50"
                />
              ) : (
                <span className="flex size-8 items-center justify-center rounded-full bg-muted ring-2 ring-border transition-all hover:ring-primary/50">
                  <UserRound className="size-4 text-muted-foreground" />
                </span>
              )}
            </Link>
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={logout}
              className="hidden sm:inline-flex"
              aria-label="Logout"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
