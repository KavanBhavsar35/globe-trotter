"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useTrips } from "@/lib/use-trips";
import { addDays } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Trip } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

// props react-day-picker hands each day cell (typed off the Calendar component)
type DayBtnProps = React.ComponentProps<
  NonNullable<NonNullable<React.ComponentProps<typeof Calendar>["components"]>["DayButton"]>
>;

function iso(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export default function CalendarPage() {
  const { trips, loading } = useTrips();
  const router = useRouter();

  // date (YYYY-MM-DD) → trips covering it. Bounded loop guards against dirty date ranges.
  const byDate = useMemo(() => {
    const m = new Map<string, Trip[]>();
    for (const t of trips) {
      let d = t.start_date;
      for (let i = 0; d <= t.end_date && i < 366; d = addDays(d, 1), i++) {
        const list = m.get(d);
        if (list) list.push(t);
        else m.set(d, [t]);
      }
    }
    return m;
  }, [trips]);

  function DayButton({ day, modifiers, className: _c, ...rest }: DayBtnProps) {
    const dayTrips = byDate.get(iso(day.date)) ?? [];
    const first = dayTrips[0];
    return (
      <button
        {...rest}
        type="button"
        onClick={() => first && router.push(`/trips/${first.id}/build`)}
        className={cn(
          "flex h-16 w-full flex-col items-start gap-0.5 rounded-md p-1 text-left align-top transition-colors hover:bg-accent",
          modifiers.outside && "opacity-40",
          modifiers.today && "ring-1 ring-primary",
          first && "bg-primary/5",
        )}
      >
        <span className="text-xs font-medium">{day.date.getDate()}</span>
        {first && (
          <span className="w-full truncate rounded bg-primary/15 px-1 text-[10px] leading-tight text-primary">
            {first.name}
          </span>
        )}
        {dayTrips.length > 1 && (
          <span className="text-[9px] text-muted-foreground">+{dayTrips.length - 1} more</span>
        )}
      </button>
    );
  }

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="flex items-center gap-2 text-3xl font-bold md:text-4xl">
          <CalendarDays className="size-7 text-primary" /> Calendar
        </h1>
        <p className="text-muted-foreground">
          Your trips laid out by date. Click a day with a trip to open its planner.
        </p>
      </section>

      {loading ? (
        <Skeleton className="h-[420px] rounded-xl" />
      ) : (
        <div className="rounded-xl border bg-card p-2 sm:p-4">
          <Calendar
            components={{ DayButton }}
            classNames={{ day_button: "" }}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
}
