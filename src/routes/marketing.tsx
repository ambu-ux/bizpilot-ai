import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Wand2 } from "lucide-react";
import { PageHeader, Panel, Field, inputCls, PrimaryBtn, AIOutput } from "@/components/ui-kit";
import { useGenerate } from "@/hooks/use-generate";

export const Route = createFileRoute("/marketing")({
  head: () => ({
    meta: [
      { title: "Marketing Studio – BizPilot AI" },
      { name: "description", content: "AI social copy and ad campaigns for Ambusise products." },
      { property: "og:title", content: "Marketing Studio – BizPilot AI" },
      { property: "og:description", content: "AI social posts and ad campaigns." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Marketing,
});

const platforms = ["Facebook", "Instagram", "LinkedIn", "WhatsApp", "TikTok", "Google Ads"];
const types = ["Social posts", "Full ad campaign", "Product launch", "Promo / special offer"];

function Marketing() {
  const [product, setProduct] = useState("Ambusise premium hardwood braai charcoal");
  const [audience, setAudience] = useState("");
  const [type, setType] = useState(types[0]);
  const [sel, setSel] = useState<string[]>(["Facebook", "Instagram"]);
  const [extra, setExtra] = useState("");
  const g = useGenerate("marketing");
  const go = () =>
    g.run(
      "You are a South African marketing copywriter for Ambusise Amanyange products. Produce platform-specific copy with hooks, captions, hashtags, CTAs and, for campaigns, objectives, audience targeting, budget split in ZAR, schedule and KPIs. Use Markdown headings per platform.",
      `Product: ${product}\nAudience: ${audience || "SA households & braai lovers"}\nContent type: ${type}\nPlatforms: ${sel.join(", ")}\nNotes: ${extra || "none"}`,
    );
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Marketing Studio" sub="AI copy & campaigns for Ambusise products." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="space-y-4">
          <Field label="Product"><input className={inputCls} value={product} onChange={(e) => setProduct(e.target.value)} /></Field>
          <Field label="Target audience"><input className={inputCls} value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g. Restaurants & shisanyamas in Eastern Cape" /></Field>
          <Field label="Content type">
            <select className={inputCls} value={type} onChange={(e) => setType(e.target.value)}>{types.map((t) => <option key={t}>{t}</option>)}</select>
          </Field>
          <Field label="Platforms">
            <div className="flex flex-wrap gap-2">
              {platforms.map((p) => (
                <button key={p} type="button" onClick={() => setSel(sel.includes(p) ? sel.filter((x) => x !== p) : [...sel, p])}
                  className={`rounded-full border px-3 py-1 text-xs ${sel.includes(p) ? "border-accent bg-sidebar-accent text-accent" : "border-border bg-muted"}`}>{p}</button>
              ))}
            </div>
          </Field>
          <Field label="Notes / offer"><textarea rows={3} className={inputCls} value={extra} onChange={(e) => setExtra(e.target.value)} /></Field>
          <PrimaryBtn loading={g.loading} disabled={!product || !sel.length} onClick={go}><Wand2 className="h-4 w-4" />Generate copy</PrimaryBtn>
        </Panel>
        <AIOutput text={g.text} loading={g.loading} />
      </div>
    </div>
  );
}
