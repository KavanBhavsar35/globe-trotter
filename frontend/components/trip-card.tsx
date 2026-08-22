"use client";

import * as React from "react";
import Link from "next/link";
import { Calendar, MapPin, Trash2, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { confirmToast } from "@/lib/confirm";
import type { Trip } from "@/lib/types";
import { fmtRange, money } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function TripCard({ trip, onDeleted }: { trip: Trip; onDeleted?: (id: number) => void }) {
  const [deleting, setDeleting] = React.useState(false);

  async function remove(e: React.MouseEvent) {
    e.preventDefault();
    if (!(await confirmToast(`Delete "${trip.name}"? This can't be undone.`))) return;
    setDeleting(true);
    try {
      await apiFetch(`/trips/${trip.id}`, { method: "DELETE" });
      toast.success("Trip deleted.");
      onDeleted?.(trip.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete.");
      setDeleting(false);
    }
  }

  const stops = trip.stop_count ?? 0;
  const budget = trip.budget_total ?? 0;

  return (
    <Link href={`/trips/${trip.id}`} className="group block h-full">
      <Card className={cn(
        "py-0 relative flex h-full flex-col overflow-hidden border-0 shadow-sm ring-1 ring-border/50 transition-all",
        "group-hover:-translate-y-1 group-hover:shadow-md"
      )}>
        {/* Cover Image */}
        <div className="relative aspect-travel-wide overflow-hidden bg-muted">
          {trip.cover_url ? (
            // eslint-disable-next-line @next/next/no-img-element -- presigned URL expires; next/image would cache a stale link
            <img 
              src={trip.cover_url} 
              alt="" 
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 group-hover:brightness-105" 
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/5 via-seafoam/5 to-coral/5">
              <MapPin className="size-12 text-muted-foreground/20" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col space-y-3 p-5">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {trip.name}
            </h3>
            {trip.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{trip.description}</p>
            )}
          </div>

          {/* Metadata */}
          <div className="flex-1 space-y-2 pt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              <span>{fmtRange(trip.start_date, trip.end_date)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                <span>{stops} {stops === 1 ? "stop" : "stops"}</span>
              </div>
              {budget > 0 && (
                <div className="flex items-center gap-1.5 font-mono">
                  <DollarSign className="size-3.5" />
                  <span>{money(budget)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Delete button */}
          <div className="flex justify-end border-t pt-3 -mx-5 -mb-5 px-5 pb-4">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Delete trip"
              disabled={deleting}
              onClick={remove}
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
}
