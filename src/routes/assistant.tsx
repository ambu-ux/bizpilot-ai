import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Plane, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, GhostBtn } from "@/components/ui-kit";
import { streamAI, type ChatMsg } from "@/lib/ai";
import { useLocal } from "@/lib/store";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Assistant – BizPilot AI" },
      { name: "description", content: "Chat live with your AI business co-pilot." },
      { property: "og:title", content: "AI Assistant – BizPilot AI" },
      { property: "og:description", content: "Live streaming AI business chat." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Assistant,
});

const chips = [
  "Draft a 90-day growth plan for a small service business",
  "How do I register for VAT with SARS?",
  "How should I price my services competitively?",
  "List SA funding agencies for small manufacturers",
];

function Assistant() {
  const [msgs, setMsgs] = useLocal<ChatMsg[]>("bp_chat", []);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
  useEffect(() => { if (!busy) taRef.current?.focus(); }, [busy]);

  const send = async (text: string) => {
    if (!text.trim() || busy) return;
    const next: ChatMsg[] = [...msgs, { role: "user", content: text.trim() }];
    setMsgs([...next, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    try {
      await streamAI({ messages: next, system: "You are a friendly, concise business co-pilot chat assistant." },
        (t) => setMsgs([...next, { role: "assistant", content: t }]), "chat");
    } catch (e) {
      toast.error((e as Error).message);
      setMsgs(next);
    } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-10rem)] max-w-4xl flex-col">
      <PageHeader title="AI Assistant" sub="Live streaming business chat">
        {msgs.length > 0 && <GhostBtn onClick={() => setMsgs([])}><Trash2 className="h-4 w-4" />New chat</GhostBtn>}
      </PageHeader>
      <div className="flex-1 space-y-5 overflow-y-auto pb-4">
        {msgs.length === 0 && (
          <div className="py-10 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand shadow-glow"><Plane className="h-7 w-7 text-primary-foreground" /></div>
            <p className="mt-4 text-muted-foreground">How can BizPilot help your business today?</p>
          </div>
        )}
        {msgs.map((m, i) => m.role === "user" ? (
          <div key={i} className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">{m.content}</div>
        ) : (
          <div key={i} className="flex gap-3">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand"><Plane className="h-4 w-4 text-primary-foreground" /></div>
            <div className="prose-ai min-w-0 flex-1">
              {m.content ? <ReactMarkdown>{m.content}</ReactMarkdown> : <Loader2 className="h-4 w-4 animate-spin text-accent" />}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
        {chips.map((c) => (
          <button key={c} onClick={() => send(c)} className="shrink-0 rounded-full border border-border bg-muted px-3 py-1.5 text-xs hover:border-accent hover:text-accent">{c}</button>
        ))}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2">
        <textarea ref={taRef} value={input} onChange={(e) => setInput(e.target.value)} rows={1}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
          placeholder="Ask anything about your business…" className="max-h-40 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none" />
        <button disabled={busy || !input.trim()} className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-primary-foreground disabled:opacity-40" aria-label="Send">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}
