"use client";

import { useEffect, useState } from "react";
import { getEmail } from "@/lib/api";

// P1 placeholder — P2 replaces this with recent trips + "Plan New Trip".
export default function DashboardPage() {
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => setEmail(getEmail()), []);
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">Welcome{email ? `, ${email}` : ""} 👋</h1>
      <p className="text-muted-foreground">
        Your trips and quick actions will appear here.
      </p>
    </div>
  );
}
