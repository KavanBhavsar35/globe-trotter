"use client";

import * as React from "react";
import Image from "next/image";
import { Check, Clock, Plus, Wallet, X } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import type { Activity, StopActivity } from "@/lib/types";
import { imageOr, money } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const selectClass =
  "h-9 rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function AddActivityDialog({
  stopId,
  cityId,
  cityName,
  existing,
  onChanged,
}: {
  stopId: number;
  cityId: number;
  cityName: string;
  existing: StopActivity[]; // activities already on this stop (has stop_activity_id)
  onChanged: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [acts, setActs] = React.useState<Activity[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [busy, setBusy] = React.useState<number | null>(null);

  // filters
  const [type, setType] = React.useState("all");
  const [maxCost, setMaxCost] = React.useState(""); // "" any | "0" free | "25" | "50" | "100"
  const [maxDur, setMaxDur] = React.useState(""); // "" any | "2" | "4" | "8"

  React.useEffect(() => {
    if (!open) return;
    setLoading(true);
    apiFetch<Activity[]>(`/cities/${cityId}/activities`)
      .then(setActs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, cityId]);

  const types = Array.from(new Set(acts.map((a) => a.type))).sort();
  const shown = acts.filter((a) => {
    if (type !== "all" && a.type !== type) return false;
    if (maxCost === "0" && a.cost !== 0) return false;
    if (maxCost && maxCost !== "0" && a.cost > Number(maxCost)) return false;
    if (maxDur && a.duration_hours > Number(maxDur)) return false;
    return true;
  });

  const linkFor = (activityId: number) =>
    existing.find((e) => e.activity_id === activityId);

  async function add(a: Activity) {
    setBusy(a.id);
    try {
      await apiFetch(`/stops/${stopId}/activities`, {
        method: "POST",
        body: { activity_id: a.id },
      });
      toast.success(`Added ${a.name}.`);
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add.");
    } finally {
      setBusy(null);
    }
  }

  async function remove(a: Activity, linkId: number) {
    setBusy(a.id);
    try {
      await apiFetch(`/stop-activities/${linkId}`, { method: "DELETE" });
      toast.success(`Removed ${a.name}.`);
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <Plus /> Add activity
          </Button>
        }
      />
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Things to do in {cityName}</DialogTitle>
          <DialogDescription>
            Filter by interest, cost or length, then add to this stop.
          </DialogDescription>
        </DialogHeader>

        {/* filters */}
        <div className="flex flex-wrap gap-2">
          <select
            className={selectClass}
            value={type}
            onChange={(e) => setType(e.target.value)}
            aria-label="Filter by type"
          >
            <option value="all">All types</option>
            {types.map((t) => (
              <option key={t} value={t} className="capitalize">
                {t}
              </option>
            ))}
          </select>
          <select
            className={selectClass}
            value={maxCost}
            onChange={(e) => setMaxCost(e.target.value)}
            aria-label="Filter by cost"
          >
            <option value="">Any cost</option>
            <option value="0">Free</option>
            <option value="25">≤ $25</option>
            <option value="50">≤ $50</option>
            <option value="100">≤ $100</option>
          </select>
          <select
            className={selectClass}
            value={maxDur}
            onChange={(e) => setMaxDur(e.target.value)}
            aria-label="Filter by duration"
          >
            <option value="">Any length</option>
            <option value="2">≤ 2h</option>
            <option value="4">≤ 4h</option>
            <option value="8">≤ 8h</option>
          </select>
        </div>

        <div className="grid max-h-[28rem] gap-3 overflow-y-auto sm:grid-cols-2">
          {loading ? (
            <p className="col-span-full p-4 text-center text-sm text-muted-foreground">
              Loading…
            </p>
          ) : shown.length === 0 ? (
            <p className="col-span-full p-4 text-center text-sm text-muted-foreground">
              No activities match these filters.
            </p>
          ) : (
            shown.map((a) => {
              const link = linkFor(a.id);
              const added = !!link;
              return (
                <div
                  key={a.id}
                  className="flex flex-col overflow-hidden rounded-lg border bg-background"
                >
                  <div className="relative h-28 w-full">
                    <Image
                      src={imageOr(a.img_url, `act-${a.id}`)}
                      alt={a.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 320px"
                      className="object-cover"
                    />
                    <Badge variant="secondary" className="absolute left-2 top-2 capitalize">
                      {a.type}
                    </Badge>
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-3">
                    <p className="text-sm font-semibold leading-tight">{a.name}</p>
                    {a.description && (
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {a.description}
                      </p>
                    )}
                    <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Wallet className="size-3" />
                          {a.cost === 0 ? "Free" : money(a.cost)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3" />
                          {a.duration_hours}h
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant={added ? "outline" : "default"}
                        disabled={busy === a.id}
                        onClick={() =>
                          added && link ? remove(a, link.stop_activity_id) : add(a)
                        }
                        className={added ? "text-destructive" : undefined}
                      >
                        {added ? (
                          <>
                            <X /> Remove
                          </>
                        ) : (
                          <>
                            <Plus /> Add
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
