import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, MapPin, Search } from "lucide-react";
import { CATEGORIES, formatDate, getEvents, ticketsSold, type EventItem } from "@/lib/store";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/events/")({
  head: () => ({
    meta: [
      { title: "Browse events — Lumen" },
      { name: "description", content: "Browse upcoming events by category, location and date." },
    ],
  }),
  component: BrowseEvents,
});

function BrowseEvents() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");

  useEffect(() => {
    const refresh = () => setEvents(getEvents().filter((e) => e.status === "published"));
    refresh();
    window.addEventListener("ebms:change", refresh);
    return () => window.removeEventListener("ebms:change", refresh);
  }, []);

  const filtered = useMemo(() => {
    return events
      .filter((e) => (cat === "All" ? true : e.category === cat))
      .filter((e) => {
        if (!q.trim()) return true;
        const s = (e.title + " " + e.location + " " + e.description).toLowerCase();
        return s.includes(q.toLowerCase());
      })
      .sort((a, b) => +new Date(a.date) - +new Date(b.date));
  }, [events, q, cat]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
      <div className="grid gap-4 sm:flex sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-semibold">Upcoming events</h1>
          <p className="mt-2 text-muted-foreground">{filtered.length} event{filtered.length === 1 ? "" : "s"} found</p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search events…" className="pl-9" />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={
              "rounded-full border px-3 py-1.5 text-sm transition-colors " +
              (cat === c
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground")
            }
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((e) => {
          const sold = ticketsSold(e.id);
          const left = e.capacity - sold;
          return (
            <Link key={e.id} to="/events/$id" params={{ id: e.id }} className="group overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-[var(--shadow-lifted)]">
              <div className="relative aspect-[16/10] overflow-hidden">
                <img src={e.image} alt={e.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur">
                  {e.category}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-display text-xl font-semibold">{e.title}</h3>
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> {formatDate(e.date)}</div>
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {e.location}</div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-semibold">{e.price === 0 ? "Free" : `$${e.price}`}</span>
                  <span className={"text-xs " + (left <= 0 ? "text-destructive" : left < 20 ? "text-warning" : "text-muted-foreground")}>
                    {left <= 0 ? "Sold out" : `${left} left`}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
            No events match your search.
          </div>
        )}
      </div>
    </div>
  );
}
