"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

// Dep: react-day-picker (v9). Install manually — see package.json.
export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  components,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "relative flex flex-col gap-4",
        month_caption: "flex h-9 items-center justify-center",
        caption_label: "text-base font-semibold",
        nav: "absolute inset-x-0 top-0 flex items-center justify-between px-1",
        button_previous: cn(buttonVariants({ variant: "outline", size: "icon-sm" })),
        button_next: cn(buttonVariants({ variant: "outline", size: "icon-sm" })),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "w-full text-[0.8rem] font-normal text-muted-foreground",
        week: "mt-2 flex w-full",
        day: "relative w-full p-0.5 text-center text-sm",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "size-9 p-0 font-normal aria-selected:opacity-100",
        ),
        today: "rounded-md bg-accent text-accent-foreground",
        outside: "text-muted-foreground opacity-50",
        disabled: "text-muted-foreground opacity-50",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight;
          return <Icon className="size-4" />;
        },
        ...components,
      }}
      {...props}
    />
  );
}

export { Calendar };
