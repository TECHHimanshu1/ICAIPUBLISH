import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { BarChart3, Files, LayoutDashboard, Settings, Shield, Users } from "lucide-react";

export const Route = createFileRoute("/admin")({ component: AdminLayout });

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/publications", label: "Publications", icon: Files },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

function AdminLayout() {
  const loc = useLocation();
  return (
    <div className="flex min-h-screen bg-secondary/30">
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-[color:var(--color-icai-blue-dark)] text-white md:flex">
        <Link to="/" className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
          <Shield className="h-5 w-5 text-[color:var(--color-icai-gold)]" />
          <div>
            <div className="text-sm font-semibold">ICAI Admin</div>
            <div className="text-[10px] text-white/60">Publication CMS</div>
          </div>
        </Link>
        <nav className="flex-1 space-y-1 p-3">
          {NAV.map((n) => {
            const active = n.exact ? loc.pathname === n.to : loc.pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${active ? "bg-white/10 text-[color:var(--color-icai-gold-light)]" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
              >
                <n.icon className="h-4 w-4" /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 text-[10px] text-white/40">Prototype · No backend</div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b bg-white px-6 py-3">
          <div className="text-sm text-muted-foreground">Admin Panel · Prototype</div>
          <Link to="/" className="text-xs text-[color:var(--color-icai-blue)] hover:underline">Back to portal →</Link>
        </header>
        <main className="flex-1 p-6"><Outlet /></main>
      </div>
    </div>
  );
}
