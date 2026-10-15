import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-kit";
import { DocBuilder } from "@/components/DocBuilder";

export const Route = createFileRoute("/invoices")({
  head: () => ({
    meta: [
      { title: "Invoice Generator – BizPilot AI" },
      { name: "description", content: "Auto-numbered invoices with 30-day terms, late fee notice and PDF preview." },
      { property: "og:title", content: "Invoice Generator – BizPilot AI" },
      { property: "og:description", content: "Auto-numbered tax invoices." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Invoice Generator" sub="Auto-numbering · 30-day terms · 10% late fee notice" />
      <DocBuilder kind="invoice" />
    </div>
  ),
});
