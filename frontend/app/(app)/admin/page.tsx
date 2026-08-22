"use client";

import { useEffect, useState } from "react";
import { Pie, PieChart, Cell, Bar, BarChart, XAxis, CartesianGrid } from "recharts";
import { Users, Plane, Globe2, Ticket, ShieldAlert } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useMe } from "@/lib/use-me";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig,
} from "@/components/ui/chart";

type AdminStats = {
  totals: { users: number; trips: number; public_trips: number; activities_added: number };
  popular_cities: { name: string; country: string; count: number }[];
  popular_activities: { name: string; type: string; count: number }[];
  users: { id: number; email: string; name: string; trip_count: number }[];
};

const barConfig: ChartConfig = { count: { label: "Times added", color: "var(--chart-2)" } };

export default function AdminPage() {
  const { me, loading } = useMe();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    if (!me?.is_admin) return;
    apiFetch<AdminStats>("/admin/stats").then(setStats).catch(() => setErr(true));
  }, [me]);

  if (loading) return <Skeleton className="h-96 rounded-2xl" />;

  if (!me?.is_admin) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-xl border border-dashed p-12 text-center">
        <ShieldAlert className="size-10 text-muted-foreground" />
        <p className="font-medium">Admins only</p>
        <p className="text-sm text-muted-foreground">
          This area is restricted. Sign in with the admin account to view it.
        </p>
      </div>
    );
  }

  const cityData = (stats?.popular_cities ?? []).map((c, i) => ({
    name: c.name, value: c.count, fill: `var(--chart-${(i % 5) + 1})`,
  }));
  const cityConfig: ChartConfig = Object.fromEntries(
    cityData.map((c) => [c.name, { label: c.name, color: c.fill }]),
  );

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="flex items-center gap-2 text-3xl font-bold md:text-4xl">
          <ShieldAlert className="size-7 text-primary" /> Admin panel
        </h1>
        <p className="text-muted-foreground">Platform overview and user management.</p>
      </section>

      {err || !stats ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : (
        <>
          {/* Stat tiles */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat icon={<Users className="size-5" />} label="Users" value={stats.totals.users} />
            <Stat icon={<Plane className="size-5" />} label="Trips" value={stats.totals.trips} />
            <Stat icon={<Globe2 className="size-5" />} label="Public trips" value={stats.totals.public_trips} />
            <Stat icon={<Ticket className="size-5" />} label="Activities added" value={stats.totals.activities_added} />
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            {/* Popular cities pie */}
            <Card>
              <CardHeader className="border-b">
                <h3 className="font-semibold">Popular destinations</h3>
                <p className="text-sm text-muted-foreground">Cities by times added to a trip</p>
              </CardHeader>
              <CardContent className="py-6">
                {cityData.length === 0 ? (
                  <p className="py-12 text-center text-sm text-muted-foreground">No data yet.</p>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2 sm:items-center">
                    <ChartContainer config={cityConfig} className="mx-auto h-56 w-full max-w-[220px]">
                      <PieChart>
                        <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="name" />} />
                        <Pie data={cityData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} strokeWidth={0}>
                          {cityData.map((d) => (
                            <Cell key={d.name} fill={d.fill} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ChartContainer>
                    <ul className="space-y-2">
                      {cityData.map((d) => (
                        <li key={d.name} className="flex items-center justify-between gap-3 text-sm">
                          <span className="inline-flex items-center gap-2">
                            <span className="size-3 rounded-sm" style={{ backgroundColor: d.fill }} />
                            {d.name}
                          </span>
                          <span className="font-mono font-semibold">{d.value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Popular activities bar */}
            <Card>
              <CardHeader className="border-b">
                <h3 className="font-semibold">Popular activities</h3>
                <p className="text-sm text-muted-foreground">Experiences by times added</p>
              </CardHeader>
              <CardContent className="py-6">
                {stats.popular_activities.length === 0 ? (
                  <p className="py-12 text-center text-sm text-muted-foreground">No data yet.</p>
                ) : (
                  <ChartContainer config={barConfig} className="h-56 w-full">
                    <BarChart data={stats.popular_activities} margin={{ left: 4, right: 4, top: 8, bottom: 8 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={10} interval={0} className="text-[10px]" />
                      <ChartTooltip content={<ChartTooltipContent nameKey="count" />} />
                      <Bar dataKey="count" fill="var(--color-count)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Manage users */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Manage users</h2>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Trips</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.name || "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{u.email}</TableCell>
                        <TableCell className="text-right font-mono">{u.trip_count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-5">
        <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          {icon}
        </span>
        <div>
          <p className="text-2xl font-bold leading-none">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
