import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Plus, Trash2, Printer, Wand2, Save } from "lucide-react";
import { toast } from "sonner";
import { Panel, Field, inputCls, PrimaryBtn, GhostBtn } from "@/components/ui-kit";
import { useLocal, defaultCompany, zar } from "@/lib/store";
import { calcTotals, dueDate, lateFee, type Line } from "@/lib/billing";
import { useGenerate } from "@/hooks/use-generate";

export function DocBuilder({ kind }: { kind: "quote" | "invoice" }) {
  const isInv = kind === "invoice";
  const seqKey = isInv ? "bp_invoice_seq" : "bp_quote_seq";
  const [company] = useLocal("bp_company", defaultCompany);
  const [seq, setSeq] = useLocal<number>(seqKey, 0);
  const today = new Date().toISOString().slice(0, 10);
  const [client, setClient] = useState({ name: "", email: "", address: "" });
  const [issue, setIssue] = useState(today);
  const [lines, setLines] = useState<Line[]>([{ desc: "Hardwood braai charcoal 10kg", qty: 50, price: 85 }]);
  const g = useGenerate(kind);
  const number = `${isInv ? "INV" : "QUO"}-${String(seq + 1).padStart(4, "0")}`;
  const t = calcTotals(lines);
  const due = dueDate(issue, 30);

  const upd = (i: number, k: keyof Line, v: string) =>
    setLines(lines.map((l, j) => (j === i ? { ...l, [k]: k === "desc" ? v : Number(v) } : l)));

  const aiNote = () =>
    g.run(
      `Write a short (max 120 words) professional ${isInv ? "invoice cover note including payment reminder" : "quotation cover note with validity of 30 days and value proposition"} in Markdown. No headings.`,
      `From: ${company.name}\nClient: ${client.name || "Valued client"}\nItems: ${lines.map((l) => `${l.qty} x ${l.desc} @ ${zar(l.price)}`).join("; ")}\nTotal incl. 15% VAT: ${zar(t.total)}${isInv ? `\nDue: ${due}. Late payments incur a 10% fee (${zar(lateFee(t.total))}).` : ""}`,
    );

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <div className="no-print space-y-4">
        <Panel className="grid gap-3 sm:grid-cols-2">
          <Field label="Client name"><input className={inputCls} value={client.name} onChange={(e) => setClient({ ...client, name: e.target.value })} /></Field>
          <Field label="Client email"><input className={inputCls} value={client.email} onChange={(e) => setClient({ ...client, email: e.target.value })} /></Field>
          <Field label="Client address"><input className={inputCls} value={client.address} onChange={(e) => setClient({ ...client, address: e.target.value })} /></Field>
          <Field label="Issue date"><input type="date" className={inputCls} value={issue} onChange={(e) => setIssue(e.target.value)} /></Field>
        </Panel>
        <Panel className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Line items</div>
          {lines.map((l, i) => (
            <div key={i} className="flex gap-2">
              <input className={`${inputCls} flex-1`} value={l.desc} onChange={(e) => upd(i, "desc", e.target.value)} placeholder="Description" />
              <input type="number" className={`${inputCls} w-16`} value={l.qty} onChange={(e) => upd(i, "qty", e.target.value)} />
              <input type="number" className={`${inputCls} w-24`} value={l.price} onChange={(e) => upd(i, "price", e.target.value)} />
              <button onClick={() => setLines(lines.filter((_, j) => j !== i))} aria-label="Remove"><Trash2 className="h-4 w-4 text-destructive" /></button>
            </div>
          ))}
          <GhostBtn onClick={() => setLines([...lines, { desc: "", qty: 1, price: 0 }])}><Plus className="h-4 w-4" />Add line</GhostBtn>
        </Panel>
        <div className="flex flex-wrap gap-2">
          <PrimaryBtn loading={g.loading} onClick={aiNote}><Wand2 className="h-4 w-4" />AI cover note</PrimaryBtn>
          <GhostBtn onClick={() => { setSeq(seq + 1); toast.success(`${number} saved`); }}><Save className="h-4 w-4" />Save & next number</GhostBtn>
          <GhostBtn onClick={() => window.print()}><Printer className="h-4 w-4" />Print / PDF</GhostBtn>
        </div>
      </div>

      <div className="print-area rounded-2xl border border-border bg-card p-6 text-sm">
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div>
            <div className="font-display text-xl font-bold text-accent">{company.name}</div>
            <div className="text-xs text-muted-foreground">Reg: {company.reg}{company.vat && ` | VAT: ${company.vat}`}</div>
            <div className="text-xs text-muted-foreground">{company.address}</div>
            <div className="text-xs text-muted-foreground">{company.email} | {company.phone}</div>
          </div>
          <div className="text-right">
            <div className="font-display text-2xl font-bold">{isInv ? "TAX INVOICE" : "QUOTATION"}</div>
            <div className="font-mono text-xs">{number}</div>
            <div className="text-xs text-muted-foreground">Date: {issue}</div>
            <div className="text-xs text-muted-foreground">{isInv ? `Due: ${due} (30 days)` : `Valid until: ${due}`}</div>
          </div>
        </div>
        <div className="py-4">
          <div className="text-xs uppercase text-muted-foreground">Bill to</div>
          <div className="font-semibold">{client.name || "—"}</div>
          <div className="text-xs text-muted-foreground">{client.email} {client.address}</div>
        </div>
        <table className="w-full">
          <thead><tr className="border-b border-border text-left text-xs text-muted-foreground"><th className="py-2">Description</th><th>Qty</th><th className="text-right">Price</th><th className="text-right">Amount</th></tr></thead>
          <tbody>
            {lines.map((l, i) => (
              <tr key={i} className="border-b border-border/50"><td className="py-2">{l.desc}</td><td>{l.qty}</td><td className="text-right">{zar(l.price)}</td><td className="text-right">{zar(l.qty * l.price)}</td></tr>
            ))}
          </tbody>
        </table>
        <div className="ml-auto mt-4 w-56 space-y-1">
          <div className="flex justify-between"><span>Subtotal</span><span>{zar(t.subtotal)}</span></div>
          <div className="flex justify-between"><span>VAT (15%)</span><span>{zar(t.vat)}</span></div>
          <div className="flex justify-between border-t border-border pt-1 font-bold text-accent"><span>Total</span><span>{zar(t.total)}</span></div>
        </div>
        {g.text && <div className="prose-ai mt-4 border-t border-border pt-3"><ReactMarkdown>{g.text}</ReactMarkdown></div>}
        <div className="mt-4 space-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
          {isInv ? (
            <>
              <p>Payment terms: 30 days from invoice date.</p>
              <p>Late payment notice: a 10% late fee ({zar(lateFee(t.total))}) applies to overdue balances.</p>
              <p>{company.bank}</p>
            </>
          ) : <p>This quotation is valid for 30 days. Prices include 15% VAT where indicated.</p>}
          <p>MD: {company.md}</p>
        </div>
      </div>
    </div>
  );
}
