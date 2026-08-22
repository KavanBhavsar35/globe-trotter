"use client";

import { useState } from "react";
import Link from "next/link";
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
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);

  const isSignup = tab === "signup";

  async function submit() {
    if (!email.includes("@")) return toast.error("Enter a valid email");
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    if (isSignup && !firstName.trim()) return toast.error("Enter your first name");
    setLoading(true);
    try {
      if (isSignup) {
        await signup(email, password, {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone.trim(),
          city: city.trim(),
          country: country.trim(),
          bio: bio.trim(),
        });
      } else {
        await login(email, password);
      }
      toast.success(isSignup ? "Account created!" : "Welcome back!");
      router.replace("/dashboard");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-md">
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
            {isSignup && (
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="first-name">First name</Label>
                  <Input
                    id="first-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ada"
                    autoComplete="given-name"
                    autoFocus
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="last-name">Last name</Label>
                  <Input
                    id="last-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Lovelace"
                    autoComplete="family-name"
                  />
                </div>
              </div>
            )}

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
                autoComplete={isSignup ? "new-password" : "current-password"}
              />
            </div>

            {isSignup && (
              <>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="phone">Phone number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555 000 1234"
                    autoComplete="tel"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="London"
                      autoComplete="address-level2"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="United Kingdom"
                      autoComplete="country-name"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="bio">Additional information</Label>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Anything else about you (optional)"
                    rows={3}
                    className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  />
                </div>
              </>
            )}

            {!isSignup && (
              <Link
                href="/forgot-password"
                className="-mt-1 self-end text-sm text-muted-foreground hover:text-foreground"
              >
                Forgot password?
              </Link>
            )}

            <Button type="submit" disabled={loading} className="mt-1 w-full">
              {loading ? "Please wait…" : isSignup ? "Register" : "Log in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
