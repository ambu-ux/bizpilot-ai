import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Wand2 } from "lucide-react";
import { PageHeader, Panel, Field, inputCls, PrimaryBtn, AIOutput } from "@/components/ui-kit";
import { useGenerate } from "@/hooks/use-generate";
import { useLocal, defaultCompany } from "@/lib/store";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator – BizPilot AI" },
      { name: "description", content: "AI drafts business emails tailored to purpose, recipient and tone." },
      { property: "og:title", content: "Smart Email Generator – BizPilot AI" },
      { property: "og:description", content: "AI-drafted professional emails." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EmailPage,
});

const tones = ["Professional", "Friendly", "Persuasive", "Formal", "Apologetic", "Urgent"];

function EmailPage() {
  const [company] = useLocal("bp_company", defaultCompany);
  const [f, setF] = useState({ purpose: "", recipient: "", tone: "Professional", details: "" });
  const g = useGenerate("email");
  const go = () =>
    g.run(
      "You write ready-to-send business emails. Output a 'Subject:' line, then the email body, then a sign-off.",
      `Purpose: ${f.purpose}\nRecipient: ${f.recipient}\nTone: ${f.tone}\nKey details: ${f.details || "none"}\nSender: ${company.md}, ${company.name} (${company.email}, ${company.phone})`,
    );
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Smart Email Generator" sub="Describe it — AI writes it." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="space-y-4">
          <Field label="Purpose"><input className={inputCls} value={f.purpose} onChange={(e) => setF({ ...f, purpose: e.target.value })} placeholder="e.g. Follow up on unpaid invoice INV-0004" /></Field>
          <Field label="Recipient"><input className={inputCls} value={f.recipient} onChange={(e) => setF({ ...f, recipient: e.target.value })} placeholder="e.g. Thabo Mokoena, Procurement Manager at Spar" /></Field>
          <Field label="Tone">
            <div className="flex flex-wrap gap-2">
              {tones.map((t) => (
                <button key={t} type="button" onClick={() => setF({ ...f, tone: t })}
                  className={`rounded-full border px-3 py-1 text-xs ${f.tone === t ? "border-accent bg-sidebar-accent text-accent" : "border-border bg-muted"}`}>{t}</button>
              ))}
            </div>
          </Field>
          <Field label="Extra details"><textarea rows={5} className={inputCls} value={f.details} onChange={(e) => setF({ ...f, details: e.target.value })} /></Field>
          <PrimaryBtn loading={g.loading} disabled={!f.purpose || !f.recipient} onClick={go}><Wand2 className="h-4 w-4" />Generate email</PrimaryBtn>
        </Panel>
        <AIOutput text={g.text} loading={g.loading} />
      </div>
    </div>
  );
}
