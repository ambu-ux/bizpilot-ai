import { useState } from "react";
import { toast } from "sonner";
import { streamAI } from "@/lib/ai";

export function useGenerate(module: string) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const run = async (system: string, prompt: string) => {
    setLoading(true);
    setText("");
    try {
      return await streamAI({ system, prompt }, setText, module);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  return { text, setText, loading, run };
}
