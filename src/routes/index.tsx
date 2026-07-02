import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarCheck, Sparkles, Ticket, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { getEvents, formatDate, type EventItem } from "@/lib/store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lumen — Discover & Book Events" },
      { name: "description", content: "Browse, book, and manage events. Organizers get dashboards, admins get full control." },
      { property: "og:title", content: "Lumen — Discover & Book Events" },
      { property: "og:description", content: "Browse, book, and manage events with confirmation, ticket codes and dashboards." },
    ],
  }),
  component: Index,
});

function Index() {
  const [events, setEvents] = useState<EventItem[]>([]);
  useEffect(() => {
    const refresh = () => setEvents(getEvents().filter((e) => e.status === "published").slice(0, 3));
    refresh();
    window.addEventListener("ebms:change", refresh);
    return () => window.removeEventListener("ebms:change", refresh);
  }, []);

  return (
    <>
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 opacity-30" style={{ background: "var(--gradient-hero)" }} />
        <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/15 bg-primary-foreground/5 px-3 py-1 text-xs">
              <Sparkles className="h-3.5 w-3.5" /> Now booking spring & summer 2026
            </div>
            <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.05] sm:text-6xl lg:text-7xl">
              Find the night<br />you'll remember.
            </h1>
            <p className="mt-5 max-w-xl text-base text-primary-foreground/75 sm:text-lg">
              Lumen is a small, focused booking platform. Browse curated events, reserve tickets in one click, and manage everything from a single dashboard.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link to="/events">Browse events <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <Link to="/auth" search={{ mode: "register" }}>Create an account</Link>
              </Button>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 text-primary-foreground/80">
              {[
                { k: "12k+", v: "Tickets booked" },
                { k: "320", v: "Organizers" },
                { k: "48", v: "Cities" },
              ].map((s) => (
                <div key={s.v}>
                  <dt className="font-display text-3xl font-semibold text-primary-foreground">{s.k}</dt>
                  <dd className="text-xs uppercase tracking-wide">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute -right-10 top-6 w-72 rotate-3 rounded-2xl bg-card p-5 text-card-foreground shadow-2xl">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                <Ticket className="h-3.5 w-3.5" /> Ticket
              </div>
              <div className="mt-2 font-display text-xl font-semibold">Aurora Music Festival</div>
              <div className="mt-1 text-sm text-muted-foreground">Fri · Riverside Park</div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Code</div>
                  <div className="font-mono text-sm">E1-9F4K22</div>
                </div>
                <div className="rounded-md bg-accent px-2 py-1 text-xs font-semibold text-accent-foreground">VIP</div>
              </div>
            </div>
            <div className="absolute right-32 top-44 w-72 -rotate-2 rounded-2xl bg-card p-5 text-card-foreground shadow-2xl">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                <CalendarCheck className="h-3.5 w-3.5" /> Confirmed
              </div>
              <div className="mt-2 font-display text-xl font-semibold">Frontend Conf 2026</div>
              <div className="mt-1 text-sm text-muted-foreground">2 tickets · $698</div>
              <div className="mt-4 h-2 w-full rounded-full bg-muted">
                <div className="h-full w-3/5 rounded-full bg-primary" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">Featured events</h2>
            <p className="mt-2 text-muted-foreground">Hand-picked from this month's lineup.</p>
          </div>
          <Link to="/events" className="hidden text-sm font-medium text-foreground underline underline-offset-4 sm:inline">View all →</Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <Link key={e.id} to="/events/$id" params={{ id: e.id }} className="group overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-[var(--shadow-lifted)]">
              <div className="aspect-[16/10] overflow-hidden">
                <img src={e.image} alt={e.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                  <span>{e.category}</span><span>·</span><span>{formatDate(e.date)}</span>
                </div>
                <h3 className="mt-2 font-display text-xl font-semibold">{e.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{e.location}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-semibold">${e.price}</span>
                  <span className="text-sm text-muted-foreground group-hover:text-foreground">Book →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-3">
          {[
            { icon: Ticket, title: "One-click booking", body: "Reserve tickets in seconds with instant confirmation and a unique ticket code." },
            { icon: Users, title: "Organizer dashboards", body: "Create events, set capacity and pricing, and track sales in real time." },
            { icon: CalendarCheck, title: "Manage everything", body: "Cancel, review and re-book from one place. Admins moderate users and events." },
          ].map((f) => (
            <div key={f.title}>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground"><f.icon className="h-5 w-5" /></span>
              <h3 className="mt-4 font-display text-xl font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="rounded-3xl bg-primary p-10 text-primary-foreground sm:p-14">
          <div className="grid items-center gap-8 md:grid-cols-[1.4fr_1fr]">
            <div>
              <h2 className="font-display text-3xl font-semibold sm:text-4xl">Hosting an event?</h2>
              <p className="mt-2 max-w-xl text-primary-foreground/80">Spin up an event page in under a minute. Set capacity, take bookings, watch the room fill.</p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link to="/auth" search={{ mode: "register" }}>Become an organizer</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <Link to="/events">See examples</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
