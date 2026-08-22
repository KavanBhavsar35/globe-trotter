"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, MapPin, Wallet, Users } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { fmtRange, imageOr, money } from "@/lib/format";
import type { CommunityTrip } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const selectClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:w-auto";

export default function CommunityPage() {
  const [trips, setTrips] = useState<CommunityTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const [sort, setSort] = useState("recent");
  const [countries, setCountries] = useState<string[]>([]);

  useEffect(() => {
    apiFetch<string[]>("/countries").then(setCountries).catch(() => {});
  }, []);

  // debounce the search text so typing doesn't spam the API
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ q, country, sort });
    const id = setTimeout(() => {
      apiFetch<CommunityTrip[]>(`/community?${params}`, { auth: false })
        .then(setTrips)
        .catch(() => setTrips([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(id);
  }, [q, country, sort]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="space-y-2">
        <h1 className="flex items-center gap-2 text-3xl font-bold md:text-4xl">
          <Users className="size-7 text-primary" /> Community
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Explore trips other travellers have shared. Search, filter by country, and sort to find
          inspiration for your next journey.
        </p>
      </section>

      {/* Controls */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="q">Search</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Trip name, country, or description…"
              className="pl-9"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="country">Country</Label>
          <select
            id="country"
            className={selectClass}
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            <option value="">All countries</option>
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sort">Sort by</Label>
          <select
            id="sort"
            className={selectClass}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="recent">Most recent</option>
            <option value="budget">Highest budget</option>
            <option value="name">Name (A–Z)</option>
          </select>
        </div>
      </section>

      {/* Results */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : trips.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-12 text-center">
          <div className="rounded-full bg-muted p-4">
            <Users className="size-8 text-muted-foreground" />
          </div>
          <p className="font-medium">No public trips found</p>
          <p className="text-sm text-muted-foreground">
            Try a different search, or share one of your own trips to get the feed started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((t) => (
            <CommunityCard key={t.id} trip={t} />
          ))}
        </div>
      )}
    </div>
  );
}

function CommunityCard({ trip }: { trip: CommunityTrip }) {
  return (
    <Link
      href={`/trip/${trip.share_token}`}
      className="group block overflow-hidden rounded-xl border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative h-36 w-full">
        {/* eslint-disable-next-line @next/next/no-img-element -- presigned cover URL / external loremflickr fallback */}
        <img
          src={imageOr(trip.cover_url, `${trip.name}, ${trip.country}`)}
          alt={trip.name}
          className="h-full w-full object-cover"
        />
        {trip.country && (
          <Badge variant="secondary" className="absolute left-2 top-2">
            <MapPin className="size-3" /> {trip.country}
          </Badge>
        )}
      </div>
      <div className="space-y-2 p-4">
        <div>
          <p className="font-semibold leading-tight group-hover:text-primary">{trip.name}</p>
          <p className="text-xs text-muted-foreground">by {trip.owner}</p>
        </div>
        {trip.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{trip.description}</p>
        )}
        <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
          <span>{fmtRange(trip.start_date, trip.end_date)}</span>
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <MapPin className="size-3" /> {trip.stop_count ?? 0}
            </span>
            <span className="flex items-center gap-1">
              <Wallet className="size-3" /> {money(trip.budget_total ?? 0)}
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
