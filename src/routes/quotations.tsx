import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-kit";
import { DocBuilder } from "@/components/DocBuilder";

export const Route = createFileRoute("/quotations")({
  head: () => ({
    meta: [
      { title: "Quotation Generator – BizPilot AI" },
      { name: "description", content: "Branded quotations with line items, 15% VAT and print view." },
      { property: "og:title", content: "Quotation Generator – BizPilot AI" },
      { property: "og:description", content: "Branded quotes with 15% VAT." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Quotation Generator" sub="Branded quotes with 15% VAT." />
      <DocBuilder kind="quote" />
    </div>
  ),
});
