import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { CalendarDays, Check, MapPin, Ticket, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { createBooking, formatDate, formatTime, getEvent, ticketsSold } from "@/lib/store";

export const Route = createFileRoute("/events/$id")({
  component: EventDetail,
  notFoundComponent: () => (
    <div className="mx-auto max-w-md py-24 text-center text-muted-foreground">Event not found.</div>
  ),
});

function EventDetail() {
  const { id } = Route.useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [qty, setQty] = useState(1);
  const [confirmation, setConfirmation] = useState<{ code: string; total: number } | null>(null);

  const event = useMemo(() => getEvent(id), [id, confirmation]);
  if (!event) return <div className="mx-auto max-w-md py-24 text-center text-muted-foreground">Event not found.</div>;
  const sold = ticketsSold(event.id);
  const left = event.capacity - sold;

  const handleBook = () => {
    if (!user) {
      router.navigate({ to: "/auth", search: { mode: "login", next: `/events/${event.id}` } });
      return;
    }
    try {
      const b = createBooking(event, user, qty);
      setConfirmation({ code: b.ticketCode, total: b.total });
      toast.success("Booking confirmed!");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div>
      <div className="relative h-80 w-full overflow-hidden sm:h-96">
        <img src={event.image} alt={event.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      </div>

      <div className="mx-auto -mt-24 grid w-full max-w-7xl gap-8 px-4 pb-16 sm:px-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="relative rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] sm:p-10">
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">{event.category}</span>
          <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">{event.title}</h1>
          <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> {formatDate(event.date)} · {formatTime(event.date)}</div>
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {event.location}</div>
            <div className="flex items-center gap-2"><Users className="h-4 w-4" /> {sold} / {event.capacity} booked</div>
            <div className="flex items-center gap-2"><Ticket className="h-4 w-4" /> Hosted by {event.organizerName}</div>
          </div>
          <div className="mt-8 max-w-prose whitespace-pre-line text-base leading-relaxed text-foreground/90">
            {event.description}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          {confirmation ? (
            <div className="rounded-3xl border border-success/40 bg-card p-6 shadow-[var(--shadow-soft)]">
              <div className="flex items-center gap-2 text-success"><Check className="h-5 w-5" /> <span className="font-semibold">Booking confirmed</span></div>
              <h3 className="mt-4 font-display text-2xl font-semibold">Your ticket</h3>
              <div className="mt-4 rounded-2xl border border-dashed border-border p-5">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Ticket code</div>
                <div className="mt-1 font-mono text-2xl font-semibold">{confirmation.code}</div>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-sm">
                  <span className="text-muted-foreground">Total paid</span>
                  <span className="font-semibold">${confirmation.total}</span>
                </div>
              </div>
              <div className="mt-5 flex gap-2">
                <Button asChild className="flex-1"><Link to="/my-bookings">View my tickets</Link></Button>
                <Button variant="outline" onClick={() => setConfirmation(null)}>Book again</Button>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
              <div className="flex items-baseline justify-between">
                <div className="font-display text-3xl font-semibold">{event.price === 0 ? "Free" : `$${event.price}`}</div>
                <span className="text-sm text-muted-foreground">per ticket</span>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {left <= 0 ? <span className="text-destructive">Sold out</span> : `${left} tickets available`}
              </div>

              <div className="mt-6 space-y-3">
                <label className="text-sm font-medium">Quantity</label>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="icon" onClick={() => setQty(Math.max(1, qty - 1))}>−</Button>
                  <Input
                    type="number" min={1} max={Math.max(1, left)} value={qty}
                    onChange={(e) => setQty(Math.max(1, Math.min(Math.max(1, left), Number(e.target.value) || 1)))}
                    className="text-center"
                  />
                  <Button type="button" variant="outline" size="icon" onClick={() => setQty(Math.min(Math.max(1, left), qty + 1))}>+</Button>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold">${qty * event.price}</span>
                </div>
                <Button className="w-full" size="lg" disabled={left <= 0} onClick={handleBook}>
                  {left <= 0 ? "Sold out" : user ? "Confirm booking" : "Sign in to book"}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  No real payment is taken — mock checkout for demo.
                </p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
