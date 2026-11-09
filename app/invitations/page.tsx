"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";

type Invitation = { id: string; inviterName: string; calendarName: string; role: "EDITOR" | "VIEWER" };

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...options?.headers } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Something went wrong.");
  return data as T;
}

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    let active = true;
    api<{ invitations: Invitation[] }>("/api/invitations")
      .then((data) => { if (active) setInvitations(data.invitations); })
      .catch((requestError) => { if (active) setError(requestError instanceof Error ? requestError.message : "Unable to load invitations."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function respond(id: string, status: "ACCEPTED" | "DECLINED") {
    setBusyId(id);
    try {
      await api("/api/invitations", { method: "PATCH", body: JSON.stringify({ id, status }) });
      setInvitations((current) => current.filter((invitation) => invitation.id !== id));
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to respond to invitation."); }
    finally { setBusyId(""); }
  }

  return (
    <div className="app-shell">
      <AppSidebar active="notifications" />
      <div className="content">
        <header className="topbar"><Link className="topbar-title" href="/">Workspace / My calendar</Link></header>
        <main className="invitations-page">
          <div className="invitations-header"><div><Link className="back-link" href="/">Back to calendar</Link><h1>Notifications</h1><p className="auth-subtitle">Manage invitations to shared calendars.</p></div><div className="brand"><div className="brand-mark">◷</div> schedulender</div></div>
          {error ? <div className="invitation-card empty"><strong>{error}</strong><span>Return to the calendar and sign in again if the server was restarted.</span><Link className="primary-button" href="/">Back to sign in</Link></div> : loading ? <div className="invitation-card empty">Loading notifications...</div> : invitations.length === 0 ? <div className="invitation-card empty"><strong>You&apos;re all caught up.</strong><span>No pending calendar invitations.</span></div> : <div className="invitation-list">{invitations.map((invitation) => <article className="invitation-card" key={invitation.id}><div className="avatar">{invitation.inviterName.slice(0, 2).toUpperCase()}</div><div className="invitation-copy"><strong>{invitation.inviterName} invited you</strong><span>to <b>{invitation.calendarName}</b> with {invitation.role === "EDITOR" ? "edit" : "view"} access</span></div><div className="invitation-actions"><button className="secondary-button" disabled={busyId === invitation.id} onClick={() => respond(invitation.id, "DECLINED")}>Decline</button><button className="primary-button" disabled={busyId === invitation.id} onClick={() => respond(invitation.id, "ACCEPTED")}>Accept</button></div></article>)}</div>}
        </main>
      </div>
    </div>
  );
}
