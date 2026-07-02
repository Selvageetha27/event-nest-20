import { Link, useRouter } from "@tanstack/react-router";
import { CalendarDays, LogOut, Ticket, LayoutDashboard, ShieldCheck, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const nav = [
    { to: "/", label: "Home" },
    { to: "/events", label: "Browse events" },
  ];

  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2" onClick={close}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <CalendarDays className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">Lumen</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeProps={{ className: "text-foreground" }}
              inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
              activeOptions={{ exact: true }}
              className="rounded-md px-3 py-2 text-sm font-medium transition-colors"
            >
              {n.label}
            </Link>
          ))}
          {user && (
            <Link to="/my-bookings" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              My tickets
            </Link>
          )}
          {user && (user.role === "organizer" || user.role === "admin") && (
            <Link to="/organizer" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              Organizer
            </Link>
          )}
          {user?.role === "admin" && (
            <Link to="/admin" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              Admin
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <div className="hidden text-right lg:block">
                <div className="text-sm font-medium leading-tight">{user.name}</div>
                <div className="text-xs capitalize text-muted-foreground leading-tight">{user.role}</div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { logout(); router.navigate({ to: "/" }); }}>
                <LogOut className="h-4 w-4" /> Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => router.navigate({ to: "/auth", search: { mode: "login" } })}>Sign in</Button>
              <Button size="sm" onClick={() => router.navigate({ to: "/auth", search: { mode: "register" } })}>Get started</Button>
            </>
          )}
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-md md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 py-3">
            <Link to="/" onClick={close} className="rounded-md px-3 py-2 text-sm">Home</Link>
            <Link to="/events" onClick={close} className="rounded-md px-3 py-2 text-sm">Browse events</Link>
            {user && <Link to="/my-bookings" onClick={close} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm"><Ticket className="h-4 w-4" /> My tickets</Link>}
            {user && (user.role === "organizer" || user.role === "admin") && (
              <Link to="/organizer" onClick={close} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm"><LayoutDashboard className="h-4 w-4" /> Organizer</Link>
            )}
            {user?.role === "admin" && (
              <Link to="/admin" onClick={close} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm"><ShieldCheck className="h-4 w-4" /> Admin</Link>
            )}
            <div className="mt-2 flex gap-2 border-t border-border pt-3">
              {user ? (
                <Button variant="outline" size="sm" className="flex-1" onClick={() => { logout(); close(); router.navigate({ to: "/" }); }}>Sign out</Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => { close(); router.navigate({ to: "/auth", search: { mode: "login" } }); }}>Sign in</Button>
                  <Button size="sm" className="flex-1" onClick={() => { close(); router.navigate({ to: "/auth", search: { mode: "register" } }); }}>Get started</Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:px-6">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-primary-foreground">
            <CalendarDays className="h-4 w-4" />
          </span>
          <span>© {new Date().getFullYear()} Lumen Events</span>
        </div>
        <div className="flex flex-wrap gap-4">
          <span>Mock data — stored locally in your browser</span>
        </div>
      </div>
    </footer>
  );
}
