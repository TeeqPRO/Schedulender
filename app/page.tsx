"use client";

import { FormEvent, useState } from "react";

type EventItem = { day: number; title: string; time: string; color: string; priority: "high" | "medium" | "low" };

const events: EventItem[] = [
  { day: 2, title: "Sprint planning", time: "09:00", color: "#ff6b4a", priority: "high" },
  { day: 4, title: "Gym", time: "18:30", color: "#70a9d8", priority: "low" },
  { day: 7, title: "Design review", time: "11:00", color: "#f6d96f", priority: "medium" },
  { day: 12, title: "Dentist", time: "13:30", color: "#ff6b4a", priority: "high" },
  { day: 15, title: "Team sync", time: "10:00", color: "#70a9d8", priority: "low" },
  { day: 18, title: "Project deadline", time: "16:00", color: "#ff6b4a", priority: "high" },
  { day: 21, title: "Dinner with Ola", time: "19:00", color: "#f6d96f", priority: "medium" },
  { day: 25, title: "Focus time", time: "08:00", color: "#70a9d8", priority: "low" },
];

const days = Array.from({ length: 35 }, (_, index) => index - 1);
const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Home() {
  const [activeNav, setActiveNav] = useState("Overview");
  const [modal, setModal] = useState<"event" | "invite" | null>(null);
  const [toast, setToast] = useState("");
  const [eventList, setEventList] = useState(events);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  function addEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") || "New event");
    const day = Number(form.get("day")) || 18;
    const priority = (String(form.get("priority")) || "medium") as EventItem["priority"];
    setEventList((current) => [...current, { title, day, priority, time: String(form.get("time") || "09:00"), color: priority === "high" ? "#ff6b4a" : priority === "low" ? "#70a9d8" : "#f6d96f" }]);
    setModal(null);
    showToast("Event added to your calendar");
  }

  function inviteUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setModal(null);
    showToast("Invitation sent");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark">◷</div> schedulender</div>
        <div className="nav-label">Workspace</div>
        {["Overview", "My calendar", "Tasks", "Insights"].map((item) => (
          <button className={`nav-item ${activeNav === item ? "active" : ""}`} key={item} onClick={() => setActiveNav(item)}>
            <span className="nav-icon">{item === "Overview" ? "⌂" : item === "My calendar" ? "□" : item === "Tasks" ? "✓" : "↗"}</span>{item}
          </button>
        ))}
        <div className="calendar-list">
          <div className="nav-label">Calendars</div>
          <div className="calendar-row"><span className="calendar-name"><i className="calendar-dot" style={{ background: "#ff6b4a" }} />Personal</span><span>•••</span></div>
          <div className="calendar-row"><span className="calendar-name"><i className="calendar-dot" style={{ background: "#70a9d8" }} />Work</span><span>•••</span></div>
          <div className="calendar-row"><span className="calendar-name"><i className="calendar-dot" style={{ background: "#a9cdbf" }} />Shared</span><span>•••</span></div>
          <button className="add-calendar" onClick={() => showToast("New calendar dialog is ready")}>＋ Add calendar</button>
        </div>
        <div className="sidebar-bottom">
          <button className="nav-item"><span className="nav-icon">⚙</span>Settings</button>
          <div className="user-card"><div className="avatar">AK</div><div><strong>Alex Kowalski</strong><span>alex@example.com</span></div><span>⌄</span></div>
        </div>
      </aside>
      <div className="content">
        <header className="topbar"><span className="topbar-title">Workspace / {activeNav}</span><div className="topbar-actions"><button className="icon-button" aria-label="Search">⌕</button><button className="icon-button" aria-label="Notifications">♧</button><div className="avatar">AK</div></div></header>
        <main className="main">
          <div className="welcome"><div><h1>Good morning, Alex <span>✦</span></h1><p>Here&apos;s what&apos;s happening with your schedule.</p></div><button className="primary-button" onClick={() => setModal("event")}>＋ Add event</button></div>
          <div className="layout-grid">
            <section className="card">
              <div className="calendar-toolbar"><span className="month">April 2025</span><div className="month-nav"><button aria-label="Previous month">‹</button><button aria-label="Next month">›</button></div></div>
              <div className="week">{weekdays.map((day) => <div className="weekday" key={day}>{day}</div>)}</div>
              <div className="day-grid">{days.map((day, index) => {
                const dayEvents = eventList.filter((event) => event.day === day);
                return <div className={`day ${day < 1 ? "muted" : ""} ${day === 18 ? "today" : ""}`} key={`${day}-${index}`}><div className="day-number">{day > 0 ? day : 30 + day}</div>{dayEvents.map((event) => <div className={`event ${event.priority}`} style={{ borderColor: event.color }} key={`${event.day}-${event.title}`}>{event.title}</div>)}</div>;
              })}</div>
            </section>
            <div className="side-stack">
              <section className="card"><div className="section-head"><h2>Today&apos;s agenda</h2><span>Friday, Apr 18</span></div><div className="agenda-list">{eventList.filter((event) => event.day === 18 || event.day === 21).slice(0, 3).map((event) => <div className="agenda-item" key={event.title}><div className="agenda-time">{event.time}</div><div className="agenda-dot" style={{ background: event.color }} /><div><strong>{event.title}</strong><span>{event.priority === "high" ? "Important event" : "Personal calendar"}</span></div></div>)}</div></section>
              <section className="card"><div className="section-head"><h2>Focus this week</h2><span>4 of 6 completed</span></div><div className="progress-wrap"><div className="progress-title"><span>Weekly goals</span><span>68%</span></div><div className="progress-bar"><div className="progress-fill" /></div></div></section>
              <section className="card"><div className="section-head"><h2>Shared with you</h2><button className="link-button" onClick={() => setModal("invite")}>＋ Invite</button></div><div className="member-list"><div className="member"><div className="avatar" style={{ background: "#f9e3ce", color: "#a7652c" }}>OS</div><div className="member-info"><strong>Ola Szymanska</strong><span>Design team</span></div><span className="role">Editor</span></div><div className="member"><div className="avatar" style={{ background: "#e5ddf3", color: "#7056a1" }}>MN</div><div className="member-info"><strong>Marcin Nowak</strong><span>Personal</span></div><span className="role">Viewer</span></div></div></section>
            </div>
          </div>
        </main>
      </div>
      {modal === "event" && <div className="modal-backdrop"><div className="modal"><h2>Add event</h2><form className="form-grid" onSubmit={addEvent}><div className="form-field"><label htmlFor="title">Event name</label><input id="title" name="title" placeholder="e.g. Client meeting" required /></div><div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr" }}><div className="form-field"><label htmlFor="day">Day</label><input id="day" name="day" type="number" min="1" max="30" defaultValue="18" /></div><div className="form-field"><label htmlFor="time">Time</label><input id="time" name="time" type="time" defaultValue="09:00" /></div></div><div className="form-field"><label htmlFor="priority">Priority</label><select id="priority" name="priority" defaultValue="medium"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModal(null)}>Cancel</button><button className="primary-button">Add event</button></div></form></div></div>}
      {modal === "invite" && <div className="modal-backdrop"><div className="modal"><h2>Invite to calendar</h2><form className="form-grid" onSubmit={inviteUser}><div className="form-field"><label htmlFor="email">Email address</label><input id="email" name="email" type="email" placeholder="name@example.com" required /></div><div className="form-field"><label htmlFor="role">Permission</label><select id="role" name="role" defaultValue="VIEWER"><option value="EDITOR">Can edit</option><option value="VIEWER">Can view</option></select></div><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModal(null)}>Cancel</button><button className="primary-button">Send invite</button></div></form></div></div>}
      {toast && <div style={{ position: "fixed", right: 24, bottom: 24, background: "#1c242c", color: "white", padding: "13px 17px", borderRadius: 6, fontSize: 12 }}>{toast}</div>}
    </div>
  );
}
