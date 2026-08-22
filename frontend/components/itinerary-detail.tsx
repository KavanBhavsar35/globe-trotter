"use client";

import * as React from "react";
import { Pie, PieChart, Cell } from "recharts";
import { Clock, Wallet } from "lucide-react";
import type { Itinerary } from "@/lib/types";
import { fmtRange, money } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
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

/** Read-only itinerary + budget tabs. Shared by the owner view and the public share page. */
export function ItineraryDetail({ it }: { it: Itinerary }) {
  const { stops, budget } = it;
  const pieData = CATS.map((c) => ({
    key: c.key,
    label: c.label,
    value: budget.categories[c.key] ?? 0,
    fill: c.color,
  })).filter((d) => d.value > 0);

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
          stops.map((stop, i) => (
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
                <Badge variant="secondary">{money(stop.subtotal)}</Badge>
              </CardHeader>

              <CardContent className="py-4">
                {stop.activities.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No activities planned.
                  </p>
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
                )}
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>

      {/* ---------- Budget ---------- */}
      <TabsContent value="budget" className="mt-4">
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
      </TabsContent>
    </Tabs>
  );
}
