// Mock data store for events, bookings, users — backed by localStorage.
export type Role = "user" | "organizer" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string; // ISO
  location: string;
  image: string;
  price: number;
  capacity: number;
  organizerId: string;
  organizerName: string;
  status: "published" | "draft";
}

export interface Booking {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  quantity: number;
  total: number;
  createdAt: string;
  ticketCode: string;
}

const K_USERS = "ebms.users";
const K_SESSION = "ebms.session";
const K_EVENTS = "ebms.events";
const K_BOOKINGS = "ebms.bookings";

const COVERS = [
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80",
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
  "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80",
  "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&q=80",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80",
  "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200&q=80",
];

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = window.localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("ebms:change", { detail: { key } }));
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function seed() {
  if (typeof window === "undefined") return;
  if (!window.localStorage.getItem(K_USERS)) {
    const users: User[] = [
      { id: "u_admin", name: "Site Admin", email: "admin@ebms.dev", password: "admin123", role: "admin" },
      { id: "u_org", name: "Nova Productions", email: "organizer@ebms.dev", password: "organizer123", role: "organizer" },
      { id: "u_user", name: "Alex Doe", email: "user@ebms.dev", password: "user123", role: "user" },
    ];
    write(K_USERS, users);
  }
  if (!window.localStorage.getItem(K_EVENTS)) {
    const now = Date.now();
    const day = 86400000;
    const events: EventItem[] = [
      {
        id: "e1", title: "Aurora Music Festival",
        description: "Three nights of indie, electronic and orchestral acts under the open sky. Food trucks, art installations, late-night sets.",
        category: "Music", date: new Date(now + 12 * day).toISOString(),
        location: "Riverside Park, Brooklyn", image: COVERS[0],
        price: 89, capacity: 1200, organizerId: "u_org", organizerName: "Nova Productions", status: "published",
      },
      {
        id: "e2", title: "Frontend Conf 2026",
        description: "A focused single-track conference on the modern web — performance, design systems, and the next decade of React.",
        category: "Tech", date: new Date(now + 30 * day).toISOString(),
        location: "Moscone West, San Francisco", image: COVERS[1],
        price: 349, capacity: 600, organizerId: "u_org", organizerName: "Nova Productions", status: "published",
      },
      {
        id: "e3", title: "Slow Food Sunday Market",
        description: "A relaxed afternoon with local farmers, bakers and natural-wine producers. Free entry, ticket includes a tasting flight.",
        category: "Food", date: new Date(now + 5 * day).toISOString(),
        location: "Old Granary, Lisbon", image: COVERS[2],
        price: 18, capacity: 300, organizerId: "u_org", organizerName: "Nova Productions", status: "published",
      },
      {
        id: "e4", title: "Northern Lights Photography Workshop",
        description: "A hands-on weekend workshop with award-winning photographers chasing the aurora across Tromsø.",
        category: "Workshop", date: new Date(now + 45 * day).toISOString(),
        location: "Tromsø, Norway", image: COVERS[3],
        price: 540, capacity: 24, organizerId: "u_org", organizerName: "Nova Productions", status: "published",
      },
      {
        id: "e5", title: "City Marathon 2026",
        description: "42.2 km through the historic centre, with pacers, hydration every 3 km and a finish-line concert.",
        category: "Sport", date: new Date(now + 60 * day).toISOString(),
        location: "Downtown, Chicago", image: COVERS[4],
        price: 65, capacity: 5000, organizerId: "u_org", organizerName: "Nova Productions", status: "published",
      },
      {
        id: "e6", title: "Modernism: A Retrospective",
        description: "An evening preview of the museum's spring show, with curator-led tours and a drinks reception.",
        category: "Art", date: new Date(now + 20 * day).toISOString(),
        location: "Tate Modern, London", image: COVERS[5],
        price: 32, capacity: 220, organizerId: "u_org", organizerName: "Nova Productions", status: "published",
      },
    ];
    write(K_EVENTS, events);
  }
  if (!window.localStorage.getItem(K_BOOKINGS)) {
    write(K_BOOKINGS, [] as Booking[]);
  }
}

// users
export const getUsers = () => read<User[]>(K_USERS, []);
export const setUsers = (u: User[]) => write(K_USERS, u);
export const getSession = () => read<User | null>(K_SESSION, null);
export const setSession = (u: User | null) => write(K_SESSION, u);

export function login(email: string, password: string): User {
  const u = getUsers().find(
    (x) => x.email.toLowerCase() === email.toLowerCase() && x.password === password,
  );
  if (!u) throw new Error("Invalid email or password");
  setSession(u);
  return u;
}

export function register(name: string, email: string, password: string, role: Role = "user"): User {
  const users = getUsers();
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("An account with that email already exists");
  }
  const u: User = { id: "u_" + uid(), name, email, password, role };
  setUsers([...users, u]);
  setSession(u);
  return u;
}

export function logout() {
  setSession(null);
}

// events
export const getEvents = () => read<EventItem[]>(K_EVENTS, []);
export const setEvents = (e: EventItem[]) => write(K_EVENTS, e);
export const getEvent = (id: string) => getEvents().find((e) => e.id === id);

export function upsertEvent(e: EventItem) {
  const all = getEvents();
  const i = all.findIndex((x) => x.id === e.id);
  if (i >= 0) all[i] = e;
  else all.unshift(e);
  setEvents(all);
}

export function deleteEvent(id: string) {
  setEvents(getEvents().filter((e) => e.id !== id));
  setBookings(getBookings().filter((b) => b.eventId !== id));
}

export function newEventTemplate(organizer: User): EventItem {
  return {
    id: "e_" + uid(),
    title: "",
    description: "",
    category: "Music",
    date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
    location: "",
    image: COVERS[Math.floor(Math.random() * COVERS.length)],
    price: 0,
    capacity: 100,
    organizerId: organizer.id,
    organizerName: organizer.name,
    status: "published",
  };
}

// bookings
export const getBookings = () => read<Booking[]>(K_BOOKINGS, []);
export const setBookings = (b: Booking[]) => write(K_BOOKINGS, b);

export function bookingsForEvent(eventId: string) {
  return getBookings().filter((b) => b.eventId === eventId);
}
export function ticketsSold(eventId: string) {
  return bookingsForEvent(eventId).reduce((s, b) => s + b.quantity, 0);
}
export function bookingsForUser(userId: string) {
  return getBookings().filter((b) => b.userId === userId);
}

export function createBooking(event: EventItem, user: User, quantity: number): Booking {
  const sold = ticketsSold(event.id);
  if (sold + quantity > event.capacity) throw new Error("Not enough tickets available");
  const b: Booking = {
    id: "b_" + uid(),
    eventId: event.id,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    quantity,
    total: quantity * event.price,
    createdAt: new Date().toISOString(),
    ticketCode: (event.id.slice(-3) + "-" + uid()).toUpperCase(),
  };
  setBookings([b, ...getBookings()]);
  return b;
}

export function cancelBooking(id: string) {
  setBookings(getBookings().filter((b) => b.id !== id));
}

export const CATEGORIES = ["All", "Music", "Tech", "Food", "Workshop", "Sport", "Art"];

export function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}
export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}
