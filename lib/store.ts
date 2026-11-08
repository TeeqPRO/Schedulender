import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID, scryptSync } from "node:crypto";

export type User = { id: string; email: string; name: string; passwordHash: string };
export type Calendar = { id: string; name: string; color: string; ownerId: string };
export type EventRecord = {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  startDate: string;
  endDate: string;
  calendarId: string;
  ownerId: string;
  color: string;
};
export type Invitation = { id: string; email: string; calendarId: string; role: "EDITOR" | "VIEWER"; status: "PENDING" };
type Store = { users: User[]; calendars: Calendar[]; events: EventRecord[]; invitations: Invitation[] };

const dataDirectory = path.join(process.cwd(), "data");
const dataFile = path.join(dataDirectory, "store.json");
const emptyStore: Store = { users: [], calendars: [], events: [], invitations: [] };

async function load(): Promise<Store> {
  try {
    return JSON.parse(await readFile(dataFile, "utf8")) as Store;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    await mkdir(dataDirectory, { recursive: true });
    await writeFile(dataFile, JSON.stringify(emptyStore, null, 2), "utf8");
    return structuredClone(emptyStore);
  }
}

async function save(store: Store) {
  await mkdir(dataDirectory, { recursive: true });
  await writeFile(dataFile, JSON.stringify(store, null, 2), "utf8");
}

export function hashPassword(password: string) {
  return scryptSync(password, "schedulender-local-salt", 64).toString("hex");
}

export async function createUser(name: string, email: string, password: string) {
  const store = await load();
  if (store.users.some((user) => user.email === email.toLowerCase())) throw new Error("EMAIL_EXISTS");
  const user: User = { id: randomUUID(), name, email: email.toLowerCase(), passwordHash: hashPassword(password) };
  store.users.push(user);
  store.calendars.push({ id: randomUUID(), name: "Personal", color: "#ff6b4a", ownerId: user.id });
  await save(store);
  return user;
}

export async function findUser(email: string, password: string) {
  const store = await load();
  const user = store.users.find((candidate) => candidate.email === email.toLowerCase());
  return user && user.passwordHash === hashPassword(password) ? user : null;
}

export async function getUser(id: string) {
  return (await load()).users.find((user) => user.id === id) ?? null;
}

export async function getCalendars(userId: string) {
  return (await load()).calendars.filter((calendar) => calendar.ownerId === userId);
}

export async function createCalendar(userId: string, name: string, color: string) {
  const store = await load();
  const calendar = { id: randomUUID(), name, color, ownerId: userId };
  store.calendars.push(calendar);
  await save(store);
  return calendar;
}

export async function getEvents(userId: string) {
  const store = await load();
  const calendars = new Set(store.calendars.filter((calendar) => calendar.ownerId === userId).map((calendar) => calendar.id));
  return store.events.filter((event) => calendars.has(event.calendarId));
}

export async function createEvent(userId: string, input: Omit<EventRecord, "id" | "ownerId">) {
  const store = await load();
  if (!store.calendars.some((calendar) => calendar.id === input.calendarId && calendar.ownerId === userId)) throw new Error("CALENDAR_NOT_FOUND");
  const event = { ...input, id: randomUUID(), ownerId: userId };
  store.events.push(event);
  await save(store);
  return event;
}

export async function updateEvent(userId: string, id: string, input: Partial<Omit<EventRecord, "id" | "ownerId">>) {
  const store = await load();
  const index = store.events.findIndex((event) => event.id === id && event.ownerId === userId);
  if (index < 0) return null;
  const allowed = ["title", "description", "priority", "startDate", "endDate", "calendarId", "color"] as const;
  const changes = Object.fromEntries(allowed.filter((key) => key in input).map((key) => [key, input[key]])) as Partial<EventRecord>;
  store.events[index] = { ...store.events[index], ...changes };
  await save(store);
  return store.events[index];
}

export async function deleteEvent(userId: string, id: string) {
  const store = await load();
  const index = store.events.findIndex((event) => event.id === id && event.ownerId === userId);
  if (index < 0) return false;
  store.events.splice(index, 1);
  await save(store);
  return true;
}

export async function createInvitation(userId: string, input: Omit<Invitation, "id" | "status">) {
  const store = await load();
  if (!store.calendars.some((calendar) => calendar.id === input.calendarId && calendar.ownerId === userId)) throw new Error("CALENDAR_NOT_FOUND");
  const invitation = { ...input, id: randomUUID(), status: "PENDING" as const };
  store.invitations.push(invitation);
  await save(store);
  return invitation;
}
