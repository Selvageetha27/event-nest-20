import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import type { Role } from "@/lib/store";

const searchSchema = z.object({
  mode: z.enum(["login", "register"]).optional().default("login"),
  next: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — Lumen" },
      { name: "description", content: "Sign in or create an account to book and manage events." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode, next } = Route.useSearch();
  const router = useRouter();
  const { login, register } = useAuth();
  const isLogin = mode === "login";

  const [email, setEmail] = useState(isLogin ? "user@ebms.dev" : "");
  const [password, setPassword] = useState(isLogin ? "user123" : "");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("user");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (isLogin) {
        const u = await login(email, password);
        toast.success(`Welcome back, ${u.name}`);
      } else {
        const u = await register(name, email, password, role);
        toast.success(`Welcome, ${u.name}`);
      }
      router.navigate({ to: next ?? "/" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:py-20">
      <div className="hidden flex-col justify-between rounded-3xl bg-primary p-10 text-primary-foreground lg:flex">
        <div>
          <h2 className="font-display text-4xl font-semibold leading-tight">Your tickets, organized.</h2>
          <p className="mt-4 max-w-md text-primary-foreground/80">
            Book events, see them in one feed, and never lose a confirmation again. Organizers and admins get full dashboards.
          </p>
        </div>
        <div className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 p-5 text-sm">
          <div className="font-semibold">Demo accounts</div>
          <ul className="mt-2 space-y-1 text-primary-foreground/80">
            <li><span className="font-mono">user@ebms.dev</span> / user123</li>
            <li><span className="font-mono">organizer@ebms.dev</span> / organizer123</li>
            <li><span className="font-mono">admin@ebms.dev</span> / admin123</li>
          </ul>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-soft)] sm:p-10">
        <h1 className="font-display text-3xl font-semibold">{isLogin ? "Welcome back" : "Create your account"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isLogin ? "Sign in to book events and access your tickets." : "It takes less than a minute."}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {!isLogin && (
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Doe" />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {!isLogin && (
            <div className="space-y-1.5">
              <Label>Account type</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["user", "organizer"] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={
                      "rounded-lg border p-3 text-left text-sm transition-colors " +
                      (role === r ? "border-primary bg-primary/5" : "border-border hover:border-foreground/30")
                    }
                  >
                    <div className="font-medium capitalize">{r}</div>
                    <div className="text-xs text-muted-foreground">
                      {r === "user" ? "Browse and book events" : "Create and manage events"}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          <Button type="submit" className="w-full" size="lg" disabled={busy}>
            {busy ? "Please wait…" : isLogin ? "Sign in" : "Create account"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {isLogin ? (
            <>New here?{" "}
              <Link to="/auth" search={{ mode: "register", next }} className="font-medium text-foreground underline underline-offset-4">Create an account</Link>
            </>
          ) : (
            <>Already have an account?{" "}
              <Link to="/auth" search={{ mode: "login", next }} className="font-medium text-foreground underline underline-offset-4">Sign in</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
