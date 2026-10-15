import { bumpUsage } from "./store";

export type ChatMsg = { role: "user" | "assistant"; content: string };

export async function streamAI(
  input: { system?: string; prompt?: string; messages?: ChatMsg[] },
  onChunk: (fullText: string) => void,
  module = "general",
  signal?: AbortSignal,
): Promise<string> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal,
  });
  if (!res.ok || !res.body) {
    const msg = await res.text().catch(() => "");
    if (res.status === 402) throw new Error("AI credits are used up. Please top up your workspace to continue.");
    if (res.status === 429) throw new Error("Too many requests right now. Please wait a moment and try again.");
    throw new Error(msg || "AI request failed.");
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    text += dec.decode(value, { stream: true });
    onChunk(text);
  }
  if (!text.trim()) throw new Error("The AI returned no content. Please try again.");
  bumpUsage(module);
  return text;
}
