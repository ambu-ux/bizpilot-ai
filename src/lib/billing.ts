export type Line = { desc: string; qty: number; price: number };

export function calcTotals(lines: Line[]) {
  const subtotal = lines.reduce((s, l) => s + (Number(l.qty) || 0) * (Number(l.price) || 0), 0);
  const vat = Math.round(subtotal * 0.15 * 100) / 100;
  return { subtotal, vat, total: subtotal + vat };
}

export function dueDate(issue: string, days = 30) {
  const d = new Date(issue + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export const lateFee = (total: number) => Math.round(total * 0.1 * 100) / 100;
