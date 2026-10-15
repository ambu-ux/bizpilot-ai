import ReactMarkdown from "react-markdown";
import { Copy, Loader2, Sparkle } from "lucide-react";
import { toast } from "sonner";
import type { ReactNode } from "react";

export function PageHeader({ title, sub, children }: { title: string; sub?: string; children?: ReactNode }) {
  return (
    <div className="no-print mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-border bg-card p-5 ${className}`}>{children}</div>;
}

export const inputCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export function PrimaryBtn({ children, loading, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button {...p} disabled={loading || p.disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90 disabled:opacity-50 ${p.className ?? ""}`}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{children}
    </button>
  );
}

export function GhostBtn({ children, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...p} className={`inline-flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2 text-sm font-medium hover:border-accent hover:text-accent ${p.className ?? ""}`}>
      {children}
    </button>
  );
}

export function AIOutput({ text, loading, empty = "Your AI-generated result will appear here." }: { text: string; loading?: boolean; empty?: string }) {
  return (
    <Panel className="min-h-64">
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-accent">
          <Sparkle className="h-3.5 w-3.5" /> AI Output {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        </span>
        {text && (
          <GhostBtn onClick={() => { navigator.clipboard.writeText(text); toast.success("Copied"); }}>
            <Copy className="h-3.5 w-3.5" /> Copy
          </GhostBtn>
        )}
      </div>
      {text ? (
        <div className="prose-ai"><ReactMarkdown>{text}</ReactMarkdown></div>
      ) : (
        <p className="text-sm text-muted-foreground">{loading ? "Thinking…" : empty}</p>
      )}
    </Panel>
  );
}
