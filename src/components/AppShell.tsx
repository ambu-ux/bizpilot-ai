import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard, Bot, Mail, NotebookPen, KanbanSquare, FileText, Receipt,
  Landmark, Megaphone, BarChart3, Settings, Menu, X, Plane,
} from "lucide-react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/assistant", label: "AI Assistant", icon: Bot },
  { to: "/email", label: "Smart Email", icon: Mail },
  { to: "/meetings", label: "Meeting Assistant", icon: NotebookPen },
  { to: "/tasks", label: "Task Planner", icon: KanbanSquare },
  { to: "/quotations", label: "Quotations", icon: FileText },
  { to: "/invoices", label: "Invoices", icon: Receipt },
  { to: "/funding", label: "Funding Proposals", icon: Landmark },
  { to: "/marketing", label: "Marketing Studio", icon: Megaphone },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside
        className={`no-print fixed inset-y-0 left-0 z-40 w-64 border-r border-sidebar-border bg-sidebar transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand shadow-glow">
            <Plane className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-display text-lg font-bold leading-none">BizPilot <span className="text-accent">AI</span></div>
            <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">by Ambusise Amanyange</div>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X className="h-5 w-5" /></button>
        </div>
        <nav className="space-y-1 px-3">
          {nav.map((n) => {
            const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                <n.icon className="h-4 w-4" />{n.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-background/70 lg:hidden" onClick={() => setOpen(false)} />}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="no-print sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur lg:hidden">
          <button onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
          <span className="font-display font-bold">BizPilot <span className="text-accent">AI</span></span>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
        <footer className="no-print border-t border-border px-4 py-4 text-center text-xs text-muted-foreground md:px-8">
          Powered by Ambusise Amanyange | AI-generated content should always be reviewed before official business use.
        </footer>
      </div>
    </div>
  );
}
