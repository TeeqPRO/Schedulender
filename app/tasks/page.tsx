"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";

type Task = { id: string; title: string; description: string; priority: "low" | "medium" | "high"; startDate: string };

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events")
      .then(async (response) => { const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.error || "Unable to load tasks."); return data.events as Task[]; })
      .then(setTasks)
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Unable to load tasks."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="app-shell">
      <AppSidebar active="tasks" />
      <div className="content">
        <header className="topbar"><Link className="topbar-title" href="/">Workspace / My calendar</Link></header>
        <main className="invitations-page">
          <div className="invitations-header"><div><Link className="back-link" href="/">Back to calendar</Link><h1>Tasks</h1><p className="auth-subtitle">Your scheduled work, ordered by date.</p></div><div className="brand"><div className="brand-mark">◷</div> schedulender</div></div>
          {error ? <div className="invitation-card empty"><strong>{error}</strong><span>Return to the calendar and sign in again if the server was restarted.</span><Link className="primary-button" href="/">Back to sign in</Link></div> : loading ? <div className="invitation-card empty">Loading tasks...</div> : tasks.length === 0 ? <div className="invitation-card empty"><strong>No tasks yet.</strong><span>Add an event from your calendar to see it here.</span><Link className="primary-button" href="/">Open calendar</Link></div> : <div className="task-list">{tasks.slice().sort((first, second) => first.startDate.localeCompare(second.startDate)).map((task) => <article className="task-card" key={task.id}><div className={`task-priority ${task.priority}`} /><div className="task-copy"><strong>{task.title}</strong><span>{task.description || "No description"}</span></div><time>{new Date(task.startDate).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</time><Link className="secondary-button" href="/">Open calendar</Link></article>)}</div>}
        </main>
      </div>
    </div>
  );
}
