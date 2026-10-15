import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Area, AreaChart } from "recharts";
import { PageHeader, Panel } from "@/components/ui-kit";
import { useLocal, defaultTasks, type Task } from "@/lib/store";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics – BizPilot AI" },
      { name: "description", content: "Productivity and AI usage charts." },
      { property: "og:title", content: "Analytics – BizPilot AI" },
      { property: "og:description", content: "Productivity and AI usage insights." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Analytics,
});

const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
const tip = { contentStyle: { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 } };

function Analytics() {
  const [tasks] = useLocal<Task[]>("bp_tasks", defaultTasks);
  const [usage, setUsage] = useState<{ name: string; value: number }[]>([]);
  const [daily, setDaily] = useState<{ day: string; count: number }[]>([]);
  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("bp_usage") || "{}") as Record<string, number>;
    setUsage(Object.entries(u).map(([name, value]) => ({ name, value })));
    const d = JSON.parse(localStorage.getItem("bp_daily") || "{}") as Record<string, number>;
    const out = [];
    for (let i = 13; i >= 0; i--) {
      const k = new Date(Date.now() - i * 864e5).toISOString().slice(0, 10);
      out.push({ day: k.slice(5), count: d[k] ?? 0 });
    }
    setDaily(out);
  }, []);
  const status = [
    { name: "To Do", value: tasks.filter((t) => t.status === "todo").length },
    { name: "In Progress", value: tasks.filter((t) => t.status === "doing").length },
    { name: "Done", value: tasks.filter((t) => t.status === "done").length },
  ];
  const rate = tasks.length ? Math.round((status[2]!.value / tasks.length) * 100) : 0;
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Analytics" sub={`Task completion rate: ${rate}%`} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="lg:col-span-2">
          <h2 className="mb-3 font-semibold">AI generations – last 14 days</h2>
          <div className="h-64"><ResponsiveContainer><AreaChart data={daily}><CartesianGrid stroke="var(--border)" /><XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} /><YAxis allowDecimals={false} stroke="var(--muted-foreground)" fontSize={11} /><Tooltip {...tip} /><Area dataKey="count" stroke="var(--chart-1)" fill="var(--chart-2)" fillOpacity={0.35} /></AreaChart></ResponsiveContainer></div>
        </Panel>
        <Panel>
          <h2 className="mb-3 font-semibold">AI usage by module</h2>
          <div className="h-64">
            {usage.length ? <ResponsiveContainer><BarChart data={usage}><CartesianGrid stroke="var(--border)" /><XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} /><YAxis allowDecimals={false} stroke="var(--muted-foreground)" fontSize={11} /><Tooltip {...tip} /><Bar dataKey="value" fill="var(--chart-1)" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer>
              : <p className="text-sm text-muted-foreground">No AI usage yet — try a generator.</p>}
          </div>
        </Panel>
        <Panel>
          <h2 className="mb-3 font-semibold">Task productivity</h2>
          <div className="h-64"><ResponsiveContainer><PieChart><Pie data={status} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} label>{status.map((_, i) => <Cell key={i} fill={colors[i]} />)}</Pie><Tooltip {...tip} /></PieChart></ResponsiveContainer></div>
        </Panel>
      </div>
    </div>
  );
}
