import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Wand2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Panel, inputCls, PrimaryBtn, GhostBtn, AIOutput } from "@/components/ui-kit";
import { useLocal, defaultTasks, type Task } from "@/lib/store";
import { streamAI } from "@/lib/ai";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Task Planner – BizPilot AI" },
      { name: "description", content: "Kanban task board with AI-powered prioritisation." },
      { property: "og:title", content: "Task Planner – BizPilot AI" },
      { property: "og:description", content: "Kanban board with AI prioritisation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Tasks,
});

const cols: { key: Task["status"]; label: string }[] = [
  { key: "todo", label: "To Do" },
  { key: "doing", label: "In Progress" },
  { key: "done", label: "Done" },
];
const order: Task["status"][] = ["todo", "doing", "done"];

function Tasks() {
  const [tasks, setTasks] = useLocal<Task[]>("bp_tasks", defaultTasks);
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [busy, setBusy] = useState(false);
  const [advice, setAdvice] = useState("");
  const [drag, setDrag] = useState<string | null>(null);

  const add = () => {
    if (!title.trim()) return;
    setTasks([...tasks, { id: crypto.randomUUID(), title: title.trim(), status: "todo", priority: "Medium", due: due || undefined }]);
    setTitle(""); setDue("");
  };
  const move = (id: string, dir: number) =>
    setTasks(tasks.map((t) => t.id === id ? { ...t, status: order[Math.min(2, Math.max(0, order.indexOf(t.status) + dir))] ?? t.status } : t));

  const prioritise = async () => {
    const open = tasks.filter((t) => t.status !== "done");
    if (!open.length) { toast.info("No open tasks to prioritise."); return; }
    setBusy(true); setAdvice("");
    try {
      const out = await streamAI({
        system: "You prioritise business tasks. First output a JSON code block: ```json\n[{\"id\":\"...\",\"priority\":\"High|Medium|Low\"}]\n``` covering every task id, then a short Markdown rationale with recommended order.",
        prompt: `Today is ${new Date().toISOString().slice(0, 10)}. Tasks:\n${open.map((t) => `- id=${t.id} | ${t.title} | status=${t.status} | due=${t.due ?? "none"}`).join("\n")}`,
      }, setAdvice, "tasks");
      const m = out.match(/```json\s*([\s\S]*?)```/);
      if (m) {
        const arr = JSON.parse(m[1] ?? "[]") as { id: string; priority: Task["priority"] }[];
        setTasks((prev) => prev.map((t) => { const f = arr.find((a) => a.id === t.id); return f && ["High", "Medium", "Low"].includes(f.priority) ? { ...t, priority: f.priority } : t; }));
        setAdvice(out.replace(m[0], "").trim());
        toast.success("Priorities updated by AI");
      }
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Task Planner" sub="Drag cards between columns.">
        <PrimaryBtn loading={busy} onClick={prioritise}><Wand2 className="h-4 w-4" />AI prioritise</PrimaryBtn>
      </PageHeader>
      <Panel className="mb-4 flex flex-wrap gap-2">
        <input className={`${inputCls} flex-1 min-w-48`} placeholder="New task…" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} />
        <input type="date" className={`${inputCls} w-auto`} value={due} onChange={(e) => setDue(e.target.value)} />
        <GhostBtn onClick={add}><Plus className="h-4 w-4" />Add</GhostBtn>
      </Panel>
      <div className="grid gap-4 md:grid-cols-3">
        {cols.map((c) => (
          <div key={c.key} onDragOver={(e) => e.preventDefault()}
            onDrop={() => { if (drag) setTasks(tasks.map((t) => t.id === drag ? { ...t, status: c.key } : t)); setDrag(null); }}
            className="min-h-48 rounded-2xl border border-border bg-card/60 p-3">
            <div className="mb-3 flex items-center justify-between px-1 text-sm font-semibold">{c.label}<span className="text-xs text-muted-foreground">{tasks.filter((t) => t.status === c.key).length}</span></div>
            <div className="space-y-2">
              {tasks.filter((t) => t.status === c.key).sort((a, b) => ["High", "Medium", "Low"].indexOf(a.priority) - ["High", "Medium", "Low"].indexOf(b.priority)).map((t) => (
                <div key={t.id} draggable onDragStart={() => setDrag(t.id)} className="cursor-grab rounded-xl border border-border bg-muted p-3">
                  <div className="text-sm">{t.title}</div>
                  <div className="mt-2 flex items-center gap-2 text-[11px]">
                    <span className={`rounded px-1.5 py-0.5 font-semibold ${t.priority === "High" ? "bg-destructive/20 text-destructive" : t.priority === "Medium" ? "bg-sidebar-accent text-accent" : "bg-secondary text-muted-foreground"}`}>{t.priority}</span>
                    {t.due && <span className="text-muted-foreground">Due {t.due}</span>}
                    <div className="ml-auto flex gap-1">
                      <button onClick={() => move(t.id, -1)} aria-label="Move left"><ChevronLeft className="h-4 w-4" /></button>
                      <button onClick={() => move(t.id, 1)} aria-label="Move right"><ChevronRight className="h-4 w-4" /></button>
                      <button onClick={() => setTasks(tasks.filter((x) => x.id !== t.id))} aria-label="Delete"><Trash2 className="h-4 w-4 text-destructive" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {(advice || busy) && <div className="mt-4"><AIOutput text={advice} loading={busy} /></div>}
    </div>
  );
}
