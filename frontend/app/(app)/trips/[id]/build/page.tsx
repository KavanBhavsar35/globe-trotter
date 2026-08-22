"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  ImagePlus,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch, apiUpload } from "@/lib/api";
import { confirmToast } from "@/lib/confirm";
import type { Itinerary } from "@/lib/types";
import { fmtRange, money } from "@/lib/format";
import { AddStopForm } from "@/components/add-stop-form";
import { AddActivityDialog } from "@/components/add-activity-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function BuildPage() {
  const params = useParams();
  const tripId = Number(params.id);
  const [it, setIt] = React.useState<Itinerary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [coverBusy, setCoverBusy] = React.useState(false);
  const coverRef = React.useRef<HTMLInputElement>(null);

  const reload = React.useCallback(async () => {
    try {
      setIt(await apiFetch<Itinerary>(`/trips/${tripId}/itinerary`));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load trip.");
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  React.useEffect(() => {
    reload();
  }, [reload]);

  async function deleteStop(stopId: number, city: string) {
    if (!(await confirmToast(`Remove ${city} and its activities?`))) return;
    try {
      await apiFetch(`/stops/${stopId}`, { method: "DELETE" });
      toast.success("Stop removed.");
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove.");
    }
  }

  async function removeActivity(linkId: number) {
    try {
      await apiFetch(`/stop-activities/${linkId}`, { method: "DELETE" });
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove.");
    }
  }

  async function uploadCover(file: File) {
    if (!file.type.startsWith("image/")) return toast.error("Pick an image file");
    setCoverBusy(true);
    try {
      const form = new FormData();
      form.append("file", file);
      await apiUpload(`/trips/${tripId}/cover`, form);
      toast.success("Cover updated.");
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setCoverBusy(false);
    }
  }

  async function removeCover() {
    if (!(await confirmToast("Remove the cover photo?"))) return;
    setCoverBusy(true);
    try {
      await apiFetch(`/trips/${tripId}/cover`, { method: "DELETE" });
      toast.success("Cover removed.");
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove.");
    } finally {
      setCoverBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }
  if (!it) return null;

  const { trip, stops, budget } = it;

  return (
    <div className="space-y-6">
      <Link
        href={`/trips/${tripId}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Trip overview
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{trip.name}</h1>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays className="size-4" />
            {fmtRange(trip.start_date, trip.end_date)}
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-sm">
          <Wallet className="size-4 text-primary" />
          <span className="font-semibold">{money(budget.total)}</span>
        </div>
      </div>

      {/* Cover photo */}
      <div>
        {trip.cover_url ? (
          <div className="relative overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element -- presigned URL expires; next/image would cache a stale link */}
            <img src={trip.cover_url} alt="" className="h-40 w-full object-cover" />
            <div className="absolute right-3 top-3 flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={coverBusy}
                onClick={() => coverRef.current?.click()}
              >
                <ImagePlus /> Change
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={coverBusy}
                onClick={removeCover}
                className="text-destructive"
              >
                <Trash2 /> Remove
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            disabled={coverBusy}
            onClick={() => coverRef.current?.click()}
          >
            <ImagePlus /> Add cover photo
          </Button>
        )}
        <input
          ref={coverRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) uploadCover(f);
          }}
        />
      </div>

      {/* Add a stop */}
      <AddStopForm tripId={tripId} trip={trip} onAdded={reload} />

      {/* Stops */}
      <div className="space-y-4">
        {stops.length === 0 && (
          <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            No stops yet — pick a city above to start building.
          </p>
        )}
        {stops.map((stop, i) => (
            <Card key={stop.stop_id} className="gap-0 overflow-hidden py-0">
              <CardHeader className="flex-row items-start justify-between gap-3 border-b bg-muted/30 py-4">
                <div className="flex items-start gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold leading-tight">
                      {stop.city.name}
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        {stop.city.country}
                      </span>
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {fmtRange(stop.start_date, stop.end_date)} · {stop.nights}{" "}
                      {stop.nights === 1 ? "night" : "nights"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{money(stop.subtotal)}</Badge>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Remove stop"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => deleteStop(stop.stop_id, stop.city.name)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="py-4">
                {stop.activities.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No activities yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {stop.activities.map((a) => (
                      <li
                        key={a.stop_activity_id}
                        className="flex items-center justify-between gap-3 rounded-md border p-2.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{a.name}</p>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline" className="capitalize">{a.type}</Badge>
                            <span>{money(a.cost)}</span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="size-3" />
                              {a.duration_hours}h
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Remove activity"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => removeActivity(a.stop_activity_id)}
                        >
                          <X />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>

              <CardFooter className="border-t py-3">
                <AddActivityDialog
                  stopId={stop.stop_id}
                  cityId={stop.city.id}
                  cityName={stop.city.name}
                  existing={stop.activities}
                  onChanged={reload}
                />
              </CardFooter>
            </Card>
          ))}
      </div>
    </div>
  );
}
