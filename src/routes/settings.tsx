import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Panel, Field, inputCls, PrimaryBtn } from "@/components/ui-kit";
import { useLocal, defaultCompany, type Company } from "@/lib/store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings – BizPilot AI" },
      { name: "description", content: "Configure your company profile used across documents and AI." },
      { property: "og:title", content: "Settings – BizPilot AI" },
      { property: "og:description", content: "Company profile configuration." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

const labels: Record<keyof Company, string> = {
  name: "Company name", reg: "Registration number", md: "Managing Director", address: "Address",
  email: "Email", phone: "Phone", vat: "VAT number", bank: "Banking details",
};

function SettingsPage() {
  const [company, setCompany] = useLocal<Company>("bp_company", defaultCompany);
  const [draft, setDraft] = useState(company);
  useEffect(() => setDraft(company), [company]);
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Settings" sub="Company profile used on quotes, invoices and AI content." />
      <Panel className="grid gap-4 sm:grid-cols-2">
        {(Object.keys(labels) as (keyof Company)[]).map((k) => (
          <Field key={k} label={labels[k]}><input className={inputCls} value={draft[k]} onChange={(e) => setDraft({ ...draft, [k]: e.target.value })} /></Field>
        ))}
        <div className="sm:col-span-2"><PrimaryBtn onClick={() => { setCompany(draft); toast.success("Profile saved"); }}><Save className="h-4 w-4" />Save profile</PrimaryBtn></div>
      </Panel>
    </div>
  );
}
