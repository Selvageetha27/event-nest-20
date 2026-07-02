import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Shield, Trash2, Users, Calendar, Ticket as TicketIcon, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import {
  deleteEvent, formatDate, getBookings, getEvents, getUsers, setUsers,
  ticketsSold, type Role, type User,
} from "@/lib/store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Lumen" }] }),
  component: Admin,
});

function Admin() {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"overview" | "events" | "users">("overview");
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!user) { router.navigate({ to: "/auth", search: { mode: "login", next: "/admin" } }); return; }
    if (user.role !== "admin") { router.navigate({ to: "/" }); return; }
    const refresh = () => setVersion((v) => v + 1);
    window.addEventListener("ebms:change", refresh);
    return () => window.removeEventListener("ebms:change", refresh);
  }, [user, router]);

  const data = useMemo(() => {
    const events = getEvents();
    const users = getUsers();
    const bookings = getBookings();
    return {
      events, users, bookings,
      revenue: bookings.reduce((s, b) => s + b.total, 0),
      tickets: bookings.reduce((s, b) => s + b.quantity, 0),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  if (!user || user.role !== "admin") return null;

  const updateRole = (id: string, role: Role) => {
    setUsers(getUsers().map((u) => (u.id === id ? { ...u, role } : u)));
    toast.success("Role updated");
  };
  const removeUser = (id: string) => {
    if (id === user.id) return toast.error("You can't delete your own admin account");
    if (!confirm("Delete this user?")) return;
    setUsers(getUsers().filter((u) => u.id !== id));
    toast.success("User deleted");
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground"><Shield className="h-5 w-5" /></span>
        <div>
          <h1 className="font-display text-4xl font-semibold">Admin panel</h1>
          <p className="text-muted-foreground">Manage users, events and platform health.</p>
        </div>
      </div>

      <div className="mt-6 flex gap-1 rounded-lg border border-border bg-card p-1 text-sm w-fit">
        {(["overview", "events", "users"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={"rounded-md px-4 py-1.5 capitalize transition-colors " + (tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Calendar} label="Events" value={data.events.length} />
          <StatCard icon={Users} label="Users" value={data.users.length} />
          <StatCard icon={TicketIcon} label="Tickets sold" value={data.tickets} />
          <StatCard icon={Wallet} label="Total revenue" value={`$${data.revenue.toLocaleString()}`} />
        </div>
      )}

      {tab === "events" && (
        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Event</th>
                <th className="hidden px-5 py-3 sm:table-cell">Organizer</th>
                <th className="hidden px-5 py-3 md:table-cell">Date</th>
                <th className="px-5 py-3">Sold</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.events.map((e) => (
                <tr key={e.id}>
                  <td className="px-5 py-3"><div className="font-medium">{e.title}</div><div className="text-xs text-muted-foreground">{e.category}</div></td>
                  <td className="hidden px-5 py-3 sm:table-cell">{e.organizerName}</td>
                  <td className="hidden px-5 py-3 md:table-cell">{formatDate(e.date)}</td>
                  <td className="px-5 py-3">{ticketsSold(e.id)} / {e.capacity}</td>
                  <td className="px-5 py-3 text-right">
                    <Button variant="ghost" size="icon" onClick={() => {
                      if (confirm("Delete event and all its bookings?")) { deleteEvent(e.id); toast.success("Event removed"); }
                    }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "users" && (
        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="hidden px-5 py-3 sm:table-cell">Email</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.users.map((u: User) => (
                <tr key={u.id}>
                  <td className="px-5 py-3 font-medium">{u.name}{u.id === user.id && <span className="ml-2 rounded bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground">you</span>}</td>
                  <td className="hidden px-5 py-3 text-muted-foreground sm:table-cell">{u.email}</td>
                  <td className="px-5 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => updateRole(u.id, e.target.value as Role)}
                      disabled={u.id === user.id}
                      className="h-8 rounded-md border border-input bg-background px-2 text-sm capitalize"
                    >
                      <option value="user">user</option>
                      <option value="organizer">organizer</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Button variant="ghost" size="icon" onClick={() => removeUser(u.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground"><Icon className="h-4 w-4" /> {label}</div>
      <div className="mt-2 font-display text-3xl font-semibold">{value}</div>
    </div>
  );
}
