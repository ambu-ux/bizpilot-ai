import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bot, Mail, NotebookPen, FileText, Receipt, Landmark, CheckCircle2, Clock, ListTodo, Sparkles as Spark } from "lucide-react";
import { PageHeader, Panel } from "@/components/ui-kit";
import { useLocal, defaultTasks, defaultCompany, type Task } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard – BizPilot AI" },
      { name: "description", content: "Your business command centre: KPIs, quick AI actions and task summary." },
      { property: "og:title", content: "Dashboard – BizPilot AI" },
      { property: "og:description", content: "Business KPIs, quick AI actions and tasks in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const quick = [
  { to: "/assistant", label: "Ask AI", icon: Bot },
  { to: "/email", label: "Draft email", icon: Mail },
  { to: "/meetings", label: "Summarise meeting", icon: NotebookPen },
  { to: "/quotations", label: "New quote", icon: FileText },
  { to: "/invoices", label: "New invoice", icon: Receipt },
  { to: "/funding", label: "Funding proposal", icon: Landmark },
] as const;

function Dashboard() {
  const [tasks] = useLocal<Task[]>("bp_tasks", defaultTasks);
  const [company] = useLocal("bp_company", defaultCompany);
  const [usage, setUsage] = useState(0);
  const [docs, setDocs] = useState(0);
  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("bp_usage") || "{}");
    setUsage(Object.values(u as Record<string, number>).reduce((a, b) => a + b, 0));
    setDocs(Number(localStorage.getItem("bp_invoice_seq") || 0) + Number(localStorage.getItem("bp_quote_seq") || 0));
  }, []);
  const done = tasks.filter((t) => t.status === "done").length;
  const kpis = [
    { label: "AI generations", value: usage, icon: Spark },
    { label: "Open tasks", value: tasks.length - done, icon: ListTodo },
    { label: "Completed", value: done, icon: CheckCircle2 },
    { label: "Quotes & invoices", value: docs, icon: Receipt },
  ];
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title={`Welcome back, ${company.md.split(" ")[0]}`} sub={company.name} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <Panel key={k.label}>
            <k.icon className="h-5 w-5 text-accent" />
            <div className="mt-3 font-display text-3xl font-bold">{k.value}</div>
            <div className="text-xs text-muted-foreground">{k.label}</div>
          </Panel>
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <h2 className="mb-4 font-semibold">Quick actions</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {quick.map((q) => (
              <Link key={q.to} to={q.to} className="group rounded-xl border border-border bg-muted p-4 transition hover:border-accent hover:shadow-glow">
                <q.icon className="h-5 w-5 text-accent" />
                <div className="mt-2 text-sm font-medium">{q.label}</div>
              </Link>
            ))}
          </div>
        </Panel>
        <Panel>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Task summary</h2>
            <Link to="/tasks" className="text-xs text-accent">View board</Link>
          </div>
          <ul className="space-y-2">
            {tasks.filter((t) => t.status !== "done").slice(0, 5).map((t) => (
              <li key={t.id} className="flex items-start gap-2 text-sm">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="flex-1">{t.title}</span>
                <span className={`rounded px-1.5 text-[10px] font-semibold ${t.priority === "High" ? "bg-destructive/20 text-destructive" : "bg-secondary text-accent"}`}>{t.priority}</span>
              </li>
            ))}
            {tasks.length === done && <li className="text-sm text-muted-foreground">All tasks done 🎉</li>}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
