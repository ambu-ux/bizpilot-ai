import { useEffect, useState } from "react";

export function useLocal<T>(key: string, initial: T) {
  const [val, setVal] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setVal(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, [key]);
  useEffect(() => {
    if (ready) localStorage.setItem(key, JSON.stringify(val));
  }, [key, val, ready]);
  return [val, setVal] as const;
}

export type Company = {
  name: string;
  reg: string;
  md: string;
  address: string;
  email: string;
  phone: string;
  vat: string;
  bank: string;
};

export const defaultCompany: Company = {
  name: "Ambusise Amanyange Charcoal (Pty) Ltd",
  reg: "2026/312659/07",
  md: "Siphosethu Hlanganise",
  address: "Qonce, Eastern Cape, South Africa",
  email: "info@ambusise.co.za",
  phone: "+27 00 000 0000",
  vat: "",
  bank: "Bank: — | Acc: — | Branch: —",
};

export type Task = {
  id: string;
  title: string;
  status: "todo" | "doing" | "done";
  priority: "High" | "Medium" | "Low";
  due?: string | undefined;
};

export const defaultTasks: Task[] = [
  { id: "1", title: "Finalise Q4 charcoal supply contract", status: "todo", priority: "High", due: "2026-10-30" },
  { id: "2", title: "Prepare investor deck", status: "doing", priority: "Medium" },
  { id: "3", title: "Register for SEDA support programme", status: "done", priority: "Low" },
];

export function bumpUsage(module: string) {
  try {
    const raw = localStorage.getItem("bp_usage");
    const u: Record<string, number> = raw ? JSON.parse(raw) : {};
    u[module] = (u[module] ?? 0) + 1;
    localStorage.setItem("bp_usage", JSON.stringify(u));
    const d = new Date().toISOString().slice(0, 10);
    const rawD = localStorage.getItem("bp_daily");
    const daily: Record<string, number> = rawD ? JSON.parse(rawD) : {};
    daily[d] = (daily[d] ?? 0) + 1;
    localStorage.setItem("bp_daily", JSON.stringify(daily));
  } catch {}
}

export const VAT_RATE = 0.15;
export const zar = (n: number) =>
  "R " + n.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
