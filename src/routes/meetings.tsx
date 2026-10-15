import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Wand2 } from "lucide-react";
import { PageHeader, Panel, Field, inputCls, PrimaryBtn, AIOutput } from "@/components/ui-kit";
import { useGenerate } from "@/hooks/use-generate";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Assistant – BizPilot AI" },
      { name: "description", content: "Turn raw meeting notes into summaries, decisions, action items and deadlines." },
      { property: "og:title", content: "Meeting Assistant – BizPilot AI" },
      { property: "og:description", content: "AI meeting notes to action items." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Meetings,
});

function Meetings() {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const g = useGenerate("meetings");
  const go = () =>
    g.run(
      "Analyse raw meeting notes. Output Markdown sections exactly: ## Summary, ## Key Decisions (bullets), ## Action Items (table: Task | Owner | Deadline), ## Deadlines (bullets), ## Open Questions. Only use information present in the notes; write 'Not specified' where missing.",
      `Meeting: ${title || "Untitled"}\n\nRaw notes:\n${notes}`,
    );
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Meeting Assistant" sub="Paste raw notes; get structured outcomes." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="space-y-4">
          <Field label="Meeting title"><input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
          <Field label="Raw notes"><textarea rows={14} className={inputCls} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Paste notes or a transcript…" /></Field>
          <PrimaryBtn loading={g.loading} disabled={notes.trim().length < 20} onClick={go}><Wand2 className="h-4 w-4" />Extract insights</PrimaryBtn>
        </Panel>
        <AIOutput text={g.text} loading={g.loading} />
      </div>
    </div>
  );
}
