"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { login, signup } from "@/lib/auth";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!email.includes("@")) return toast.error("Enter a valid email");
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    try {
      if (tab === "login") await login(email, password);
      else await signup(email, password);
      toast.success(tab === "login" ? "Welcome back!" : "Account created!");
      router.replace("/dashboard");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">GlobeTrotter</CardTitle>
          <CardDescription>Plan your next multi-city adventure</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={(v) => setTab(String(v))} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="login">Log in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>
          </Tabs>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="mt-4 flex flex-col gap-3"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                autoComplete={tab === "login" ? "current-password" : "new-password"}
              />
            </div>
            <Button type="submit" disabled={loading} className="mt-1 w-full">
              {loading ? "Please wait…" : tab === "login" ? "Log in" : "Create account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
