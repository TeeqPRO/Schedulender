"use client";

import { FormEvent, useEffect, useState } from "react";

type User = { id: string; name: string; email: string };
type Calendar = { id: string; name: string; color: string };
type EventItem = { id: string; title: string; description: string; priority: "low" | "medium" | "high"; startDate: string; endDate: string; calendarId: string; color: string };
type AuthMode = "login" | "register";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const colors = { high: "#ff6b4a", medium: "#f6d96f", low: "#70a9d8" };

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...options?.headers } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Something went wrong.");
  return data as T;
}

function dateValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authError, setAuthError] = useState("");
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [month, setMonth] = useState("2026-11");
  const [today, setToday] = useState("");
  const [selected, setSelected] = useState<EventItem | null>(null);
  const [modal, setModal] = useState<"event" | "invite" | null>(null);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const [calendarData, eventData] = await Promise.all([api<{ calendars: Calendar[] }>("/api/calendars"), api<{ events: EventItem[] }>("/api/events")]);
    setCalendars(calendarData.calendars);
    setEvents(eventData.events);
  };

  useEffect(() => {
    const currentDate = dateValue(new Date());
    api<{ user: User }>("/api/auth/me").then((data) => { setUser(data.user); return refresh(); }).catch(() => undefined).finally(() => {
      setToday(currentDate);
      setMonth(currentDate.slice(0, 7));
      setLoading(false);
    });
  }, []);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError("");
    const form = new FormData(event.currentTarget);
    try {
      const data = await api<{ user: User }>(`/api/auth/${authMode}`, { method: "POST", body: JSON.stringify({ name: form.get("name"), email: form.get("email"), password: form.get("password") }) });
      setUser(data.user);
      await refresh();
    } catch (error) { setAuthError(error instanceof Error ? error.message : "Unable to authenticate."); }
  }

  async function submitEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = { title: String(form.get("title")), description: String(form.get("description") || ""), priority: String(form.get("priority")), startDate: `${form.get("date")}T${form.get("time")}:00`, endDate: `${form.get("date")}T${form.get("endTime")}:00`, calendarId: calendars[0]?.id, color: colors[String(form.get("priority")) as keyof typeof colors] };
    try {
      if (selected) await api(`/api/events`, { method: "PATCH", body: JSON.stringify({ ...payload, id: selected.id }) });
      else await api("/api/events", { method: "POST", body: JSON.stringify(payload) });
      await refresh(); setSelected(null); setModal(null); showToast(selected ? "Event updated" : "Event added");
    } catch (error) { showToast(error instanceof Error ? error.message : "Unable to save event"); }
  }

  async function removeEvent() {
    if (!selected || !window.confirm(`Delete "${selected.title}"?`)) return;
    try { await api(`/api/events?id=${selected.id}`, { method: "DELETE" }); await refresh(); setSelected(null); showToast("Event deleted"); }
    catch (error) { showToast(error instanceof Error ? error.message : "Unable to delete event"); }
  }

  if (loading) return <div className="auth-page"><div className="auth-card"><div className="brand"><div className="brand-mark">◷</div> schedulender</div><p>Loading your workspace…</p></div></div>;
  if (!user) return <div className="auth-page"><div className="auth-card"><div className="brand"><div className="brand-mark">◷</div> schedulender</div><h1>{authMode === "login" ? "Welcome back" : "Create your workspace"}</h1><p className="auth-subtitle">{authMode === "login" ? "Sign in to manage your schedule." : "Start planning focused days today."}</p><form className="form-grid" onSubmit={submitAuth}>{authMode === "register" && <div className="form-field"><label htmlFor="name">Name</label><input id="name" name="name" required /></div>}<div className="form-field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" required /></div><div className="form-field"><label htmlFor="password">Password (8+ characters)</label><input id="password" name="password" type="password" minLength={8} required /></div>{authError && <p className="error">{authError}</p>}<button className="primary-button">{authMode === "login" ? "Sign in" : "Create account"}</button></form><button className="link-button auth-switch" onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setAuthError(""); }}>{authMode === "login" ? "Need an account? Register" : "Already have an account? Sign in"}</button></div></div>;

  const monthDate = new Date(`${month}-01T00:00:00`);
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const offset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
  const gridDays = Array.from({ length: Math.ceil((offset + daysInMonth) / 7) * 7 }, (_, index) => index - offset + 1);
  const monthEvents = events.filter((event) => new Date(event.startDate).getMonth() === monthDate.getMonth() && new Date(event.startDate).getFullYear() === monthDate.getFullYear());
  const todayEvents = events.filter((event) => event.startDate.slice(0, 10) === today);
  const formEvent = selected;

  return <div className="app-shell"><aside className="sidebar"><div className="brand"><div className="brand-mark">◷</div> schedulender</div><div className="nav-label">Workspace</div><button className="nav-item active"><span className="nav-icon">□</span>My calendar</button><button className="nav-item"><span className="nav-icon">✓</span>Tasks</button><div className="calendar-list"><div className="nav-label">Calendars</div>{calendars.map((calendar) => <div className="calendar-row" key={calendar.id}><span className="calendar-name"><i className="calendar-dot" style={{ background: calendar.color }} />{calendar.name}</span></div>)}<button className="add-calendar" onClick={() => showToast("Use Add event to create a calendar event")}>＋ Add calendar</button></div><div className="sidebar-bottom"><button className="nav-item" onClick={async () => { await api("/api/auth/logout", { method: "POST" }); setUser(null); }}>↪ Sign out</button><div className="user-card"><div className="avatar">{user.name.slice(0, 2).toUpperCase()}</div><div><strong>{user.name}</strong><span>{user.email}</span></div></div></div></aside><div className="content"><header className="topbar"><span className="topbar-title">Workspace / My calendar</span><div className="topbar-actions"><div className="avatar">{user.name.slice(0, 2).toUpperCase()}</div></div></header><main className="main"><div className="welcome"><div><h1>Good morning, {user.name.split(" ")[0]} <span>✦</span></h1><p>Here&apos;s what&apos;s happening with your schedule.</p></div><button className="primary-button" onClick={() => { setSelected(null); setModal("event"); }}>＋ Add event</button></div><div className="layout-grid"><section className="card"><div className="calendar-toolbar"><span className="month">{monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span><div className="month-nav"><button onClick={() => { const value = new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1); setMonth(dateValue(value).slice(0, 7)); }}>‹</button><button onClick={() => { const value = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1); setMonth(dateValue(value).slice(0, 7)); }}>›</button></div></div><div className="week">{weekdays.map((day) => <div className="weekday" key={day}>{day}</div>)}</div><div className="day-grid">{gridDays.map((day, index) => { const dayEvents = day > 0 && day <= daysInMonth ? monthEvents.filter((event) => new Date(event.startDate).getDate() === day) : []; return <div className={`day ${day < 1 || day > daysInMonth ? "muted" : ""} ${today === dateValue(new Date(monthDate.getFullYear(), monthDate.getMonth(), day)) ? "today" : ""}`} key={`${day}-${index}`}><div className="day-number">{new Date(monthDate.getFullYear(), monthDate.getMonth(), day).getDate()}</div>{dayEvents.map((item) => <button className={`event ${item.priority}`} style={{ borderColor: item.color }} key={item.id} onClick={() => setSelected(item)}>{item.title}</button>)}</div>; })}</div></section><div className="side-stack"><section className="card"><div className="section-head"><h2>Today&apos;s agenda</h2><span>{todayEvents.length} events</span></div><div className="agenda-list">{todayEvents.length ? todayEvents.map((item) => <button className="agenda-item" key={item.id} onClick={() => setSelected(item)}><div className="agenda-time">{new Date(item.startDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div><div className="agenda-dot" style={{ background: item.color }} /><div><strong>{item.title}</strong><span>{item.priority} priority</span></div></button>) : <div className="empty">No events today.</div>}</div></section><section className="card"><div className="section-head"><h2>Shared with you</h2><button className="link-button" onClick={() => setModal("invite")}>＋ Invite</button></div><div className="empty">Invite teammates to collaborate on your calendar.</div></section></div></div></main></div>{(modal === "event" || selected) && <div className="modal-backdrop"><div className="modal"><h2>{selected ? "Edit event" : "Add event"}</h2><form className="form-grid" onSubmit={submitEvent}><div className="form-field"><label htmlFor="title">Event name</label><input id="title" name="title" defaultValue={formEvent?.title} placeholder="e.g. Client meeting" required /></div><div className="form-field"><label htmlFor="description">Description</label><input id="description" name="description" defaultValue={formEvent?.description} /></div><div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr" }}><div className="form-field"><label htmlFor="date">Date</label><input id="date" name="date" type="date" defaultValue={formEvent?.startDate.slice(0, 10) || today} required /></div><div className="form-field"><label htmlFor="time">Start</label><input id="time" name="time" type="time" defaultValue={formEvent?.startDate.slice(11, 16) || "09:00"} required /></div></div><div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr" }}><div className="form-field"><label htmlFor="endTime">End</label><input id="endTime" name="endTime" type="time" defaultValue={formEvent?.endDate.slice(11, 16) || "10:00"} required /></div><div className="form-field"><label htmlFor="priority">Priority</label><select id="priority" name="priority" defaultValue={formEvent?.priority || "medium"}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div></div><div className="modal-actions">{selected && <button type="button" className="danger-button" onClick={removeEvent}>Delete</button>}<span /><button type="button" className="secondary-button" onClick={() => { setSelected(null); setModal(null); }}>Cancel</button><button className="primary-button">Save</button></div></form></div></div>}{modal === "invite" && <div className="modal-backdrop"><div className="modal"><h2>Invite to calendar</h2><form className="form-grid" onSubmit={async (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); try { await api("/api/invitations", { method: "POST", body: JSON.stringify({ email: form.get("email"), role: form.get("role"), calendarId: calendars[0]?.id }) }); setModal(null); showToast("Invitation sent"); } catch (error) { showToast(error instanceof Error ? error.message : "Unable to invite"); } }}><div className="form-field"><label htmlFor="invite-email">Email address</label><input id="invite-email" name="email" type="email" required /></div><div className="form-field"><label htmlFor="role">Permission</label><select id="role" name="role"><option value="EDITOR">Can edit</option><option value="VIEWER">Can view</option></select></div><div className="modal-actions"><span /><button type="button" className="secondary-button" onClick={() => setModal(null)}>Cancel</button><button className="primary-button">Send invite</button></div></form></div></div>}{toast && <div className="toast">{toast}</div>}</div>;
}
