import { createFileRoute } from "@tanstack/react-router";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage } from "ai";

const BASE_SYSTEM =
  "You are BizPilot AI, an AI business assistant (powered by Ambusise Amanyange) for businesses in any industry — trades like plumbing and electrical, retail, services, construction, food and more. Tailor answers to the user's own business and industry. Use South African business context (ZAR, 15% VAT) where relevant. Write clear, professional, well-structured Markdown. Never invent facts presented as verified.";

export const Route = createFileRoute("/api/ai")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return new Response("AI is not configured.", { status: 500 });
        const body = (await request.json()) as {
          system?: string;
          prompt?: string;
          messages?: { role: "user" | "assistant"; content: string }[];
        };
        const messages: ModelMessage[] =
          body.messages && body.messages.length
            ? body.messages.slice(-30).map((m) => ({ role: m.role, content: String(m.content).slice(0, 20000) }))
            : [{ role: "user", content: String(body.prompt ?? "").slice(0, 20000) }];

        const provider = createOpenAI({
          baseURL: "https://ai.gateway.lovable.dev/v1",
          apiKey,
          headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
        });
        let upstreamStatus = 0;
        let upstreamMsg = "";
        const result = streamText({
          model: provider.responses("openai/gpt-6-astra"),
          system: body.system ? `${BASE_SYSTEM}\n\n${body.system}` : BASE_SYSTEM,
          messages,
          maxRetries: 0,
          abortSignal: request.signal,
          providerOptions: {
            openai: {
              forceReasoning: true,
              reasoningEffort: "low",
              reasoningSummary: "auto",
              store: false,
              include: ["reasoning.encrypted_content"],
            },
          },
          onError: ({ error }) => {
            const e = error as { statusCode?: number; message?: string };
            upstreamStatus = e?.statusCode ?? 500;
            upstreamMsg = e?.message ?? "AI request failed";
            console.error("AI error", upstreamStatus, upstreamMsg);
          },
        });
        void upstreamStatus;
        void upstreamMsg;
        return result.toTextStreamResponse({
          headers: { "Cache-Control": "no-cache, no-transform" },
        });
      },
    },
  },
});
