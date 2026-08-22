"use client";

import * as React from "react";
import Image from "next/image";
import { Pie, PieChart, Cell, Bar, BarChart, XAxis, CartesianGrid } from "recharts";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  TriangleAlert, 
  Wallet,
  Utensils,
  Landmark,
  Palmtree,
  Theater,
  Mountain,
  Waves
} from "lucide-react";
import type { Itinerary, ItineraryStop, StopActivity } from "@/lib/types";
import { addDays, fmtDateLong, fmtRange, money, imageOr } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

// Budget categories with new palette
const CATS = [
  { key: "stay", label: "Accommodation", color: "var(--chart-1)" },
  { key: "meals", label: "Dining", color: "var(--chart-2)" },
  { key: "transport", label: "Transport", color: "var(--chart-3)" },
  { key: "activities", label: "Experiences", color: "var(--chart-4)" },
] as const;

const chartConfig: ChartConfig = Object.fromEntries(
  CATS.map((c) => [c.key, { label: c.label, color: c.color }])
);

const barConfig: ChartConfig = { cost: { label: "Cost", color: "var(--chart-1)" } };

// Activity type icons
const ACTIVITY_ICONS: Record<string, typeof Utensils> = {
  food: Utensils,
  sightseeing: Landmark,
  culture: Theater,
  adventure: Mountain,
  nature: Palmtree,
  relax: Waves,
};

// Generate consistent color per city based on name hash
function cityColor(name: string): string {
  const colors = [
    "oklch(0.50 0.14 240)", // ocean
    "oklch(0.68 0.15 35)",  // coral
    "oklch(0.72 0.08 180)", // seafoam
    "oklch(0.65 0.18 50)",  // amber
    "oklch(0.55 0.12 280)", // purple
  ];
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

/** Activity rows with improved visual hierarchy */
function ActivityList({ activities }: { activities: StopActivity[] }) {
  if (activities.length === 0) {
    return (
      <p className="rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        No activities planned yet
      </p>
    );
  }
  
  return (
    <ul className="space-y-3">
      {activities.map((a) => {
        const Icon = ACTIVITY_ICONS[a.type] || MapPin;
        return (
          <li
            key={a.stop_activity_id}
            className="group flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:border-primary/30"
          >
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium leading-tight">{a.name}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <Badge variant="secondary" className="capitalize font-normal">
                  {a.type}
                </Badge>
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3" />
                  {a.duration_hours}h
                </span>
                <span className="font-mono font-medium">{money(a.cost)}</span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** Editorial timeline view - the signature element */
function ListView({ stops }: { stops: ItineraryStop[] }) {
  return (
    <div className="relative space-y-8">
      {stops.map((stop, i) => {
        const color = cityColor(stop.city.name);
        const isLast = i === stops.length - 1;
        
        return (
          <div key={stop.stop_id} className="relative flex gap-6">
            {/* Timeline rail */}
            <div className="flex flex-col items-center">
              <div 
                className="flex size-10 shrink-0 items-center justify-center rounded-full font-heading text-sm font-bold text-white shadow-md"
                style={{ backgroundColor: color }}
              >
                {i + 1}
              </div>
              {!isLast && (
                <div 
                  className="mt-2 w-1 flex-1 rounded-full"
                  style={{ backgroundColor: color, opacity: 0.2, minHeight: "2rem" }}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              {/* City header with image */}
              <div className="mb-4 overflow-hidden rounded-xl border-0 shadow-sm ring-1 ring-border/50">
                <div className="relative aspect-city-banner overflow-hidden">
                  <Image
                    src={imageOr(stop.city.img_url, `${stop.city.name}, ${stop.city.country}`)}
                    alt={stop.city.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 720px"
                    className="object-cover"
                  />
                  <div className="image-scrim-dark absolute inset-0" />
                  <div className="absolute inset-x-0 top-0 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-2xl font-bold text-white drop-shadow-md">
                          {stop.city.name}
                        </h3>
                        <p className="text-sm text-white/90">{stop.city.country}</p>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className="bg-white/90 text-foreground backdrop-blur-sm"
                      >
                        {money(stop.subtotal)}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {/* Metadata bar */}
                <div className="flex flex-wrap items-center gap-4 bg-card px-5 py-3 text-sm">
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="size-4" />
                    <span className="font-medium text-foreground">
                      {fmtRange(stop.start_date, stop.end_date)}
                    </span>
                  </span>
                  <div className="h-4 w-px bg-border" />
                  <span className="text-muted-foreground">
                    {stop.nights} {stop.nights === 1 ? "night" : "nights"}
                  </span>
                </div>
              </div>

              {/* Activities */}
              <div className="pl-2">
                <ActivityList activities={stop.activities} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}


type DayRow = {
  key: string;
  dayNo: number;
  date: string;
  stop: ItineraryStop;
  isFirst: boolean;
};

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

/** Day-by-day calendar view with improved visual hierarchy */
function CalendarView({ stops }: { stops: ItineraryStop[] }) {
  const rows = toDayRows(stops);
  
  return (
    <div className="space-y-6">
      {rows.map((row, idx) => {
        const color = cityColor(row.stop.city.name);
        const isLast = idx === rows.length - 1;
        
        return (
          <div key={row.key} className="relative flex gap-6">
            {/* Timeline rail */}
            <div className="flex flex-col items-center">
              <div 
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-full font-heading text-sm font-bold transition-all",
                  row.isFirst 
                    ? "text-white shadow-md" 
                    : "border-2 bg-background text-muted-foreground"
                )}
                style={row.isFirst ? { backgroundColor: color, borderColor: color } : { borderColor: color }}
              >
                {row.dayNo}
              </div>
              {!isLast && (
                <div 
                  className="mt-2 w-0.5 flex-1"
                  style={{ 
                    backgroundColor: color, 
                    opacity: 0.3,
                    minHeight: "3rem"
                  }}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-2">
              <div className="mb-2">
                <p className="label-caps text-muted-foreground">
                  Day {row.dayNo}
                </p>
                <p className="text-sm font-medium">{fmtDateLong(row.date)}</p>
              </div>
              
              {row.isFirst ? (
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4 rounded-lg border bg-card/50 p-4">
                    <div>
                      <h3 className="text-lg font-semibold">{row.stop.city.name}</h3>
                      <p className="text-sm text-muted-foreground">{row.stop.city.country}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {row.stop.nights} {row.stop.nights === 1 ? "night" : "nights"}
                      </p>
                    </div>
                    <Badge variant="secondary">{money(row.stop.subtotal)}</Badge>
                  </div>
                  <ActivityList activities={row.stop.activities} />
                </div>
              ) : (
                <p className="inline-flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                  <MapPin className="size-4" />
                  Exploring {row.stop.city.name}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Read-only itinerary + budget tabs with improved design */
export function ItineraryDetail({ it }: { it: Itinerary }) {
  const { stops, budget } = it;
  const [view, setView] = React.useState<"list" | "calendar">("list");
  
  const pieData = CATS.map((c) => ({
    key: c.key,
    label: c.label,
    value: budget.categories[c.key] ?? 0,
    fill: c.color,
  })).filter((d) => d.value > 0);

  const barData = stops.map((s) => ({ city: s.city.name, cost: s.subtotal }));

  const OVER = 1.4;
  const overDays =
    budget.per_day_avg > 0
      ? stops
          .map((s) => ({ name: s.city.name, daily: Math.round(s.subtotal / s.nights) }))
          .filter((s) => s.daily > budget.per_day_avg * OVER)
      : [];

  return (
    <Tabs defaultValue="itinerary" className="space-y-6">
      <TabsList>
        <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
        <TabsTrigger value="budget">Budget</TabsTrigger>
      </TabsList>

      {/* ---------- Itinerary ---------- */}
      <TabsContent value="itinerary" className="space-y-6">
        {stops.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed bg-muted/30 p-12 text-center">
            <div className="rounded-xl bg-primary/10 p-4">
              <MapPin className="size-10 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">No stops planned yet</p>
              <p className="text-sm text-muted-foreground">
                Start building your itinerary to see your journey come to life
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* View toggle - only show for calendar option */}
            {stops.some(s => s.nights > 1) && (
              <div className="inline-flex items-center gap-2 rounded-lg border p-1">
                <button
                  onClick={() => setView("list")}
                  className={cn(
                    "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                    view === "list" 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Timeline
                </button>
                <button
                  onClick={() => setView("calendar")}
                  className={cn(
                    "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                    view === "calendar" 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Day-by-day
                </button>
              </div>
            )}

            {view === "list" ? (
              <ListView stops={stops} />
            ) : (
              <CalendarView stops={stops} />
            )}
          </>
        )}
      </TabsContent>

      {/* ---------- Budget ---------- */}
      <TabsContent value="budget" className="space-y-6">
        {overDays.length > 0 && (
          <div className="flex items-start gap-3 rounded-xl border border-alert/40 bg-alert/10 p-4">
            <TriangleAlert className="mt-0.5 size-5 shrink-0 text-alert" />
            <div className="space-y-1">
              <p className="font-semibold">Over-budget destinations</p>
              <p className="text-sm text-muted-foreground">
                {overDays
                  .map((d) => `${d.name} (${money(d.daily)}/day)`)
                  .join(", ")}{" "}
                exceed the trip average of {money(budget.per_day_avg)}/day
              </p>
            </div>
          </div>
        )}

        {/* Budget summary */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-4 rounded-xl border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Wallet className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Estimated Total</p>
                <p className="stat-number">{money(budget.total)}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4 rounded-xl border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-seafoam/10">
                <Calendar className="size-5 text-seafoam" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Daily Average</p>
                <p className="stat-number">{money(budget.per_day_avg)}</p>
              </div>
            </div>
          </div>
        </div>

        {budget.total === 0 ? (
          <div className="rounded-xl border-2 border-dashed bg-muted/30 p-12 text-center text-sm text-muted-foreground">
            Add destinations and activities to see your budget breakdown
          </div>
        ) : (
          <>
            {/* Pie chart + breakdown */}
            <Card>
              <CardHeader className="border-b">
                <h3 className="font-semibold">Budget breakdown</h3>
                <p className="text-sm text-muted-foreground">
                  Estimated costs by category
                </p>
              </CardHeader>
              <CardContent className="grid gap-8 py-8 sm:grid-cols-2 sm:items-center">
                <ChartContainer
                  config={chartConfig}
                  className="mx-auto h-64 w-full max-w-[260px]"
                >
                  <PieChart>
                    <ChartTooltip
                      content={<ChartTooltipContent hideLabel nameKey="key" />}
                    />
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="key"
                      innerRadius={70}
                      outerRadius={100}
                      strokeWidth={0}
                    >
                      {pieData.map((d) => (
                        <Cell key={d.key} fill={d.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>

                <ul className="space-y-3">
                  {CATS.map((c) => {
                    const val = budget.categories[c.key] ?? 0;
                    const pct = budget.total
                      ? Math.round((val / budget.total) * 100)
                      : 0;
                    return (
                      <li
                        key={c.key}
                        className="flex items-center justify-between gap-4"
                      >
                        <span className="inline-flex items-center gap-2.5 text-sm">
                          <span
                            className="size-3 shrink-0 rounded-sm"
                            style={{ backgroundColor: c.color }}
                          />
                          <span className="font-medium">{c.label}</span>
                        </span>
                        <span className="text-sm">
                          <span className="font-mono font-semibold">{money(val)}</span>
                          <span className="ml-2 text-muted-foreground">{pct}%</span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>

            {/* Bar chart - cost by destination */}
            {barData.length > 1 && (
              <Card>
                <CardHeader className="border-b">
                  <h3 className="font-semibold">Cost by destination</h3>
                  <p className="text-sm text-muted-foreground">
                    Estimated total per stop
                  </p>
                </CardHeader>
                <CardContent className="py-6">
                  <ChartContainer config={barConfig} className="h-64 w-full">
                    <BarChart data={barData} margin={{ left: 4, right: 4, top: 8, bottom: 8 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                      <XAxis
                        dataKey="city"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={12}
                        interval={0}
                        className="text-xs"
                      />
                      <ChartTooltip
                        content={<ChartTooltipContent nameKey="cost" />}
                      />
                      <Bar dataKey="cost" fill="var(--color-cost)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </TabsContent>
    </Tabs>
  );
}
