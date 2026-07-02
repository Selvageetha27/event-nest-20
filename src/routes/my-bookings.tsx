import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarDays, MapPin, Ticket, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { bookingsForUser, cancelBooking, formatDate, getEvent, type Booking } from "@/lib/store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/my-bookings")({
  head: () => ({ meta: [{ title: "My tickets — Lumen" }] }),
  component: MyBookings,
});

function MyBookings() {
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Booking[]>([]);

  useEffect(() => {
    if (!user) {
      router.navigate({ to: "/auth", search: { mode: "login", next: "/my-bookings" } });
      return;
    }
    const refresh = () => setItems(bookingsForUser(user.id));
    refresh();
    window.addEventListener("ebms:change", refresh);
    return () => window.removeEventListener("ebms:change", refresh);
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl font-semibold">My tickets</h1>
      <p className="mt-2 text-muted-foreground">{items.length} booking{items.length === 1 ? "" : "s"}</p>

      {items.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <Ticket className="mx-auto h-8 w-8 text-muted-foreground" />
          <h3 className="mt-3 font-display text-xl">No bookings yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Browse events and grab your first ticket.</p>
          <Button asChild className="mt-5"><Link to="/events">Browse events</Link></Button>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {items.map((b) => {
            const e = getEvent(b.eventId);
            return (
              <div key={b.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 overflow-hidden rounded-2xl border border-border bg-card p-4 sm:flex sm:flex-row sm:p-0">
                <div className="hidden h-32 w-48 shrink-0 overflow-hidden sm:block">
                  {e && <img src={e.image} alt={e.title} className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1 sm:py-5 sm:pr-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">{e?.category}</div>
                  <h3 className="mt-1 truncate font-display text-xl font-semibold">{e?.title ?? "Event removed"}</h3>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    {e && <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />{formatDate(e.date)}</span>}
                    {e && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{e.location}</span>}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    <span>{b.quantity} ticket{b.quantity === 1 ? "" : "s"}</span>
                    <span className="font-mono text-xs">{b.ticketCode}</span>
                    <span className="font-semibold">${b.total}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 sm:pr-5">
                  {e && <Button asChild variant="outline" size="sm"><Link to="/events/$id" params={{ id: e.id }}>View</Link></Button>}
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => { cancelBooking(b.id); toast.success("Booking cancelled"); }}
                  >
                    <X className="h-4 w-4" /> Cancel
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
