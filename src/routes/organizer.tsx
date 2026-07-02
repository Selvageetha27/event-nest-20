import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2, Users, Wallet, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth";
import {
  CATEGORIES, deleteEvent, formatDate, getBookings, getEvents,
  newEventTemplate, ticketsSold, upsertEvent, type EventItem,
} from "@/lib/store";

export const Route = createFileRoute("/organizer")({
  head: () => ({ meta: [{ title: "Organizer dashboard — Lumen" }] }),
  component: Organizer,
});

function Organizer() {
  const { user } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [editing, setEditing] = useState<EventItem | null>(null);

  useEffect(() => {
    if (!user) { router.navigate({ to: "/auth", search: { mode: "login", next: "/organizer" } }); return; }
    if (user.role === "user") { router.navigate({ to: "/" }); return; }
    const refresh = () => {
      const all = getEvents();
      setEvents(user.role === "admin" ? all : all.filter((e) => e.organizerId === user.id));
    };
    refresh();
    window.addEventListener("ebms:change", refresh);
    return () => window.removeEventListener("ebms:change", refresh);
  }, [user, router]);

  const stats = useMemo(() => {
    const ids = new Set(events.map((e) => e.id));
    const bs = getBookings().filter((b) => ids.has(b.eventId));
    return {
      events: events.length,
      tickets: bs.reduce((s, b) => s + b.quantity, 0),
      revenue: bs.reduce((s, b) => s + b.total, 0),
    };
  }, [events]);

  if (!user || user.role === "user") return null;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-4xl font-semibold">Organizer dashboard</h1>
          <p className="mt-2 truncate text-muted-foreground">Signed in as {user.name}</p>
        </div>
        <Button onClick={() => setEditing(newEventTemplate(user))}><Plus className="h-4 w-4" /> New event</Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat icon={CalendarIcon} label="Active events" value={stats.events} />
        <Stat icon={Users} label="Tickets sold" value={stats.tickets} />
        <Stat icon={Wallet} label="Revenue" value={`$${stats.revenue.toLocaleString()}`} />
      </div>

      <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-display text-xl font-semibold">Your events</h2>
        </div>
        {events.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">No events yet. Create your first one.</div>
        ) : (
          <div className="divide-y divide-border">
            {events.map((e) => {
              const sold = ticketsSold(e.id);
              const pct = Math.min(100, Math.round((sold / e.capacity) * 100));
              return (
                <div key={e.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 p-5 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_auto]">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                      <span>{e.category}</span><span>·</span>
                      <span className={e.status === "published" ? "text-success" : "text-warning"}>{e.status}</span>
                    </div>
                    <h3 className="mt-1 truncate font-display text-lg font-semibold">{e.title || "Untitled event"}</h3>
                    <div className="mt-0.5 text-sm text-muted-foreground">{formatDate(e.date)} · {e.location}</div>
                  </div>
                  <div className="hidden min-w-0 sm:block">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{sold} / {e.capacity} sold</span><span>{pct}%</span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: pct + "%" }} />
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setEditing(e)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => {
                      if (confirm(`Delete "${e.title}"? This removes all bookings.`)) {
                        deleteEvent(e.id); toast.success("Event deleted");
                      }
                    }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <EventDialog open={!!editing} value={editing} onClose={() => setEditing(null)} onSave={(v) => {
        upsertEvent(v); setEditing(null); toast.success("Event saved");
      }} />
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" /> {label}
      </div>
      <div className="mt-2 font-display text-3xl font-semibold">{value}</div>
    </div>
  );
}

function EventDialog({ open, value, onClose, onSave }: {
  open: boolean; value: EventItem | null; onClose: () => void; onSave: (e: EventItem) => void;
}) {
  const [draft, setDraft] = useState<EventItem | null>(value);
  useEffect(() => setDraft(value), [value]);
  if (!draft) return null;
  const set = <K extends keyof EventItem>(k: K, v: EventItem[K]) => setDraft({ ...draft, [k]: v });
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>{value?.title ? "Edit event" : "New event"}</DialogTitle></DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Title</Label>
            <Input value={draft.title} onChange={(e) => set("title", e.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Description</Label>
            <Textarea rows={4} value={draft.description} onChange={(e) => set("description", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={draft.category} onChange={(e) => set("category", e.target.value)}>
              {CATEGORIES.filter((c) => c !== "All").map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={draft.status} onChange={(e) => set("status", e.target.value as EventItem["status"])}>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Date & time</Label>
            <Input type="datetime-local" value={draft.date.slice(0, 16)} onChange={(e) => set("date", new Date(e.target.value).toISOString())} />
          </div>
          <div className="space-y-1.5">
            <Label>Location</Label>
            <Input value={draft.location} onChange={(e) => set("location", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Price (USD)</Label>
            <Input type="number" min={0} value={draft.price} onChange={(e) => set("price", Number(e.target.value) || 0)} />
          </div>
          <div className="space-y-1.5">
            <Label>Capacity</Label>
            <Input type="number" min={1} value={draft.capacity} onChange={(e) => set("capacity", Number(e.target.value) || 1)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Cover image URL</Label>
            <Input value={draft.image} onChange={(e) => set("image", e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={!draft.title.trim() || !draft.location.trim()} onClick={() => onSave(draft)}>Save event</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
