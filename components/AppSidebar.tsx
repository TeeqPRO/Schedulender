import Link from "next/link";

export function AppSidebar({ active }: { active: "notifications" | "tasks" }) {
  return <aside className="sidebar"><div className="brand"><div className="brand-mark">◷</div> schedulender</div><div className="nav-label">Workspace</div><Link className="nav-item" href="/"><span className="nav-icon">□</span>My calendar</Link><Link className={`nav-item ${active === "notifications" ? "active" : ""}`} href="/invitations"><span className="nav-icon">♢</span>Notifications</Link><Link className={`nav-item ${active === "tasks" ? "active" : ""}`} href="/tasks"><span className="nav-icon">✓</span>Tasks</Link></aside>;
}
