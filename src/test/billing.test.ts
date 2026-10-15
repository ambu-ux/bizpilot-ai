import { describe, it, expect } from "vitest";
import { calcTotals, dueDate, lateFee } from "@/lib/billing";

describe("billing rules", () => {
  it("applies 15% VAT", () => {
    expect(calcTotals([{ desc: "a", qty: 2, price: 100 }]).vat).toBe(30);
  });
  it("invoice due in 30 days", () => {
    expect(dueDate("2026-10-01")).toBe("2026-10-31");
  });
  it("late fee is 10%", () => {
    expect(lateFee(1000)).toBe(100);
  });
});
