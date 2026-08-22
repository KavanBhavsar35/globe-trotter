"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarDays, MapPin, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { confirmToast } from "@/lib/confirm";
import type { Trip } from "@/lib/types";
import { fmtRange } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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
  return (
    <Link href={`/trips/${trip.id}`} className="group block">
      <Card className="relative gap-0 overflow-hidden py-0 transition-all group-hover:-translate-y-0.5 group-hover:shadow-lg">
        <div className="h-2 bg-gradient-to-r from-primary to-chart-2" />
        <CardHeader className="pt-5">
          <CardTitle className="text-lg">{trip.name}</CardTitle>
          {trip.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">{trip.description}</p>
          )}
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2 pb-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-4" />
            {fmtRange(trip.start_date, trip.end_date)}
          </span>
        </CardContent>
        <CardFooter className="justify-between border-t py-3">
          <Badge variant="secondary" className="gap-1">
            <MapPin className="size-3.5" />
            {stops} {stops === 1 ? "stop" : "stops"}
          </Badge>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Delete trip"
            disabled={deleting}
            onClick={remove}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 />
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
