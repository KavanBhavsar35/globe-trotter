"use client";

import * as React from "react";
import Image from "next/image";
import { Pie, PieChart, Cell, Bar, BarChart, XAxis, CartesianGrid } from "recharts";
import { CalendarDays, Clock, List, MapPin, TriangleAlert, Wallet } from "lucide-react";
import type { Itinerary, ItineraryStop, StopActivity } from "@/lib/types";
import { addDays, fmtDateLong, fmtRange, money, imageOr } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

// Fixed category order + palette (matches --chart-1..4 in globals.css).
const CATS = [
  { key: "stay", label: "Stay", color: "var(--chart-1)" },
  { key: "meals", label: "Meals", color: "var(--chart-2)" },
  { key: "transport", label: "Transport", color: "var(--chart-3)" },
  { key: "activities", label: "Activities", color: "var(--chart-4)" },
] as const;

const chartConfig: ChartConfig = Object.fromEntries(
  CATS.map((c) => [c.key, { label: c.label, color: c.color }])
);

const barConfig: ChartConfig = { cost: { label: "Cost", color: "var(--chart-1)" } };

/** Activity rows for a stop — shared by list + calendar views. */
function ActivityList({ activities }: { activities: StopActivity[] }) {
  if (activities.length === 0) {
    return <p className="text-sm text-muted-foreground">No activities planned.</p>;
  }
  return (
    <ul className="space-y-2">
      {activities.map((a) => (
        <li
          key={a.stop_activity_id}
          className="flex items-center justify-between gap-3 rounded-md border p-2.5"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{a.name}</p>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="capitalize">
                {a.type}
              </Badge>
              <span>{money(a.cost)}</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3" />
                {a.duration_hours}h
              </span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** City name + country + date range + subtotal — shared heading line. */
function CityHeading({ stop }: { stop: ItineraryStop }) {
  return (
    <div className="flex items-start justify-between gap-3">
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
      <Badge variant="secondary">{money(stop.subtotal)}</Badge>
    </div>
  );
}

/** Stacked city cards with a cover image — the classic list view. */
function ListView({ stops }: { stops: ItineraryStop[] }) {
  return (
    <div className="space-y-4">
      {stops.map((stop, i) => (
        <Card key={stop.stop_id} className="gap-0 overflow-hidden py-0">
          <div className="relative h-32 w-full">
            <Image
              src={imageOr(stop.city.img_url, `${stop.city.name}, ${stop.city.country}`)}
              alt={stop.city.name}
              fill
              sizes="(max-width: 768px) 100vw, 640px"
              className="object-cover"
            />
          </div>
          <CardHeader className="flex-row items-start gap-3 border-b bg-muted/30 py-4">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {i + 1}
            </span>
            <div className="flex-1">
              <CityHeading stop={stop} />
            </div>
          </CardHeader>
          <CardContent className="py-4">
            <ActivityList activities={stop.activities} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

type DayRow = {
  key: string;
  dayNo: number;
  date: string;
  stop: ItineraryStop;
  isFirst: boolean; // first day of this stop → show full card
};

// Expand stops into one row per night. Activities aren't day-assigned in the
// data, so they render on the stop's first day; later days show a slim marker.
// ponytail: per-day activity scheduling needs a day field on StopActivity — add if asked.
function toDayRows(stops: ItineraryStop[]): DayRow[] {
  const rows: DayRow[] = [];
  let dayNo = 0;
  for (const stop of stops) {
    for (let d = 0; d < stop.nights; d++) {
      dayNo += 1;
      rows.push({
        key: `${stop.stop_id}-${d}`,
        dayNo,
        date: addDays(stop.start_date, d),
        stop,
        isFirst: d === 0,
      });
    }
  }
  return rows;
}

/** Day-by-day vertical timeline. */
function CalendarView({ stops }: { stops: ItineraryStop[] }) {
  const rows = toDayRows(stops);
  return (
    <div>
      {rows.map((row, idx) => (
        <div key={row.key} className="relative flex gap-4">
          {/* rail: day number + connector */}
          <div className="flex flex-col items-center">
            <span
              className={`flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                row.isFirst
                  ? "bg-primary text-primary-foreground"
                  : "border bg-background text-muted-foreground"
              }`}
            >
              {row.dayNo}
            </span>
            {idx < rows.length - 1 && <span className="w-px flex-1 bg-border" />}
          </div>

          {/* content */}
          <div className="flex-1 pb-6">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Day {row.dayNo} · {fmtDateLong(row.date)}
            </p>
            {row.isFirst ? (
              <Card className="mt-1.5 gap-0 py-0">
                <CardHeader className="border-b bg-muted/30 py-3">
                  <CityHeading stop={row.stop} />
                </CardHeader>
                <CardContent className="py-3">
                  <ActivityList activities={row.stop.activities} />
                </CardContent>
              </Card>
            ) : (
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-3.5" />
                Exploring {row.stop.city.name}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Read-only itinerary + budget tabs. Shared by the owner view and the public share page. */
export function ItineraryDetail({ it }: { it: Itinerary }) {
  const { stops, budget } = it;
  const [view, setView] = React.useState<"list" | "calendar">("list");
  const pieData = CATS.map((c) => ({
    key: c.key,
    label: c.label,
    value: budget.categories[c.key] ?? 0,
    fill: c.color,
  })).filter((d) => d.value > 0);

  // Per-destination totals for the bar chart.
  const barData = stops.map((s) => ({ city: s.city.name, cost: s.subtotal }));

  // Overbudget alert: flag stops whose daily rate runs well above the trip average.
  // ponytail: heuristic (no user-set budget field) — flags daily > 1.4× the trip avg.
  const OVER = 1.4;
  const overDays =
    budget.per_day_avg > 0
      ? stops
          .map((s) => ({ name: s.city.name, daily: Math.round(s.subtotal / s.nights) }))
          .filter((s) => s.daily > budget.per_day_avg * OVER)
      : [];

  return (
    <Tabs defaultValue="itinerary">
      <TabsList>
        <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
        <TabsTrigger value="budget">Budget</TabsTrigger>
      </TabsList>

      {/* ---------- Itinerary ---------- */}
      <TabsContent value="itinerary" className="mt-4 space-y-4">
        {stops.length === 0 ? (
          <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            No stops planned yet.
          </p>
        ) : (
          <>
            {/* view mode toggle */}
            <div className="inline-flex rounded-lg border p-0.5">
              <Button
                size="sm"
                variant={view === "list" ? "default" : "ghost"}
                onClick={() => setView("list")}
              >
                <List /> List
              </Button>
              <Button
                size="sm"
                variant={view === "calendar" ? "default" : "ghost"}
                onClick={() => setView("calendar")}
              >
                <CalendarDays /> Calendar
              </Button>
            </div>

            {view === "list" ? (
              <ListView stops={stops} />
            ) : (
              <CalendarView stops={stops} />
            )}
          </>
        )}
      </TabsContent>

      {/* ---------- Budget ---------- */}
      <TabsContent value="budget" className="mt-4 space-y-4">
        {overDays.length > 0 && (
          <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-medium">Over-budget days</p>
              <p className="text-muted-foreground">
                {overDays
                  .map((d) => `${d.name} (${money(d.daily)}/day)`)
                  .join(", ")}{" "}
                — above the {money(budget.per_day_avg)}/day trip average.
              </p>
            </div>
          </div>
        )}
        <Card>
          <CardHeader className="flex-row flex-wrap items-center justify-between gap-4 border-b">
            <div className="inline-flex items-center gap-2">
              <Wallet className="size-5 text-primary" />
              <div>
                <p className="text-2xl font-bold leading-none">
                  {money(budget.total)}
                </p>
                <p className="text-xs text-muted-foreground">Estimated total</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold leading-none">
                {money(budget.per_day_avg)}
              </p>
              <p className="text-xs text-muted-foreground">Per day avg</p>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 py-6 sm:grid-cols-2 sm:items-center">
            {budget.total === 0 ? (
              <p className="text-sm text-muted-foreground sm:col-span-2">
                Add stops and activities to see the budget breakdown.
              </p>
            ) : (
              <>
                <ChartContainer
                  config={chartConfig}
                  className="mx-auto h-56 w-full max-w-[240px]"
                >
                  <PieChart>
                    <ChartTooltip
                      content={<ChartTooltipContent hideLabel nameKey="key" />}
                    />
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="key"
                      innerRadius={55}
                      strokeWidth={2}
                    >
                      {pieData.map((d) => (
                        <Cell key={d.key} fill={d.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>

                <ul className="space-y-2.5">
                  {CATS.map((c) => {
                    const val = budget.categories[c.key] ?? 0;
                    const pct = budget.total
                      ? Math.round((val / budget.total) * 100)
                      : 0;
                    return (
                      <li
                        key={c.key}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <span className="inline-flex items-center gap-2">
                          <span
                            className="size-3 shrink-0 rounded-[3px]"
                            style={{ backgroundColor: c.color }}
                          />
                          {c.label}
                        </span>
                        <span className="text-muted-foreground">
                          {money(val)}
                          <span className="ml-1.5 tabular-nums">{pct}%</span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </CardContent>
        </Card>

        {budget.total > 0 && barData.length > 1 && (
          <Card>
            <CardHeader className="border-b">
              <p className="font-semibold">Cost by destination</p>
              <p className="text-xs text-muted-foreground">
                Estimated total per stop.
              </p>
            </CardHeader>
            <CardContent className="py-6">
              <ChartContainer config={barConfig} className="h-56 w-full">
                <BarChart data={barData} margin={{ left: 4, right: 4, top: 8 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="city"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    interval={0}
                    className="text-xs"
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent nameKey="cost" />}
                  />
                  <Bar dataKey="cost" fill="var(--color-cost)" radius={6} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}
