import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Wand2 } from "lucide-react";
import { PageHeader, Panel, Field, inputCls, PrimaryBtn, AIOutput } from "@/components/ui-kit";
import { useGenerate } from "@/hooks/use-generate";
import { useLocal, defaultCompany } from "@/lib/store";

export const Route = createFileRoute("/funding")({
  head: () => ({
    meta: [
      { title: "Funding Proposal Generator – BizPilot AI" },
      { name: "description", content: "Build investor-ready funding proposals with a live readiness score." },
      { property: "og:title", content: "Funding Proposal Generator – BizPilot AI" },
      { property: "og:description", content: "AI investor proposals with readiness score." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Funding,
});

const fields = [
  ["amount", "Funding amount (ZAR)"], ["funder", "Target funder (e.g. NEF, SEFA, IDC)"],
  ["problem", "Problem & opportunity"], ["solution", "Product / solution"],
  ["market", "Target market"], ["traction", "Traction & revenue"],
  ["team", "Team"], ["use", "Use of funds"], ["impact", "Jobs & social impact"],
] as const;
type K = (typeof fields)[number][0];

function Funding() {
  const [company] = useLocal("bp_company", defaultCompany);
  const [f, setF] = useState<Record<K, string>>(Object.fromEntries(fields.map(([k]) => [k, ""])) as Record<K, string>);
  const g = useGenerate("funding");
  const score = Math.round(
    fields.reduce((s, [k]) => s + Math.min(1, f[k].trim().length / (k === "amount" || k === "funder" ? 3 : 60)), 0) / fields.length * 100,
  );
  const go = () =>
    g.run(
      "Write a compelling, investor-ready funding proposal in Markdown with sections: Executive Summary, Problem, Solution, Market Opportunity, Business Model, Traction, Team, Funding Request & Use of Funds, Financial Outlook, Impact (jobs, B-BBEE, community), Risks & Mitigation, Conclusion. End with '## Readiness Feedback' listing 3 concrete gaps to strengthen.",
      `Company: ${company.name} (Reg ${company.reg}), MD ${company.md}, ${company.address}\n` + fields.map(([k, l]) => `${l}: ${f[k] || "not provided"}`).join("\n"),
    );
  const color = score >= 75 ? "text-accent" : score >= 40 ? "text-chart-5" : "text-destructive";
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Funding Proposal Generator" sub="Fill in the details — watch your readiness score grow." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="space-y-3">
          <div className="flex items-center gap-4 rounded-xl border border-border bg-muted p-4">
            <div className={`font-display text-4xl font-bold ${color}`}>{score}%</div>
            <div className="flex-1">
              <div className="text-sm font-semibold">Funding Readiness Score</div>
              <div className="mt-2 h-2 rounded-full bg-background"><div className="h-2 rounded-full bg-brand transition-all" style={{ width: `${score}%` }} /></div>
            </div>
          </div>
          {fields.map(([k, l]) => (
            <Field key={k} label={l}>
              {k === "amount" || k === "funder"
                ? <input className={inputCls} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
                : <textarea rows={2} className={inputCls} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />}
            </Field>
          ))}
          <PrimaryBtn loading={g.loading} disabled={score < 20} onClick={go}><Wand2 className="h-4 w-4" />Generate proposal</PrimaryBtn>
        </Panel>
        <AIOutput text={g.text} loading={g.loading} />
      </div>
    </div>
  );
}
