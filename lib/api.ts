export interface MoneyEntry {
  id: string;
  amount: number;
  note: string;
  timestamp: number;
}

export async function fetchEntries(): Promise<MoneyEntry[]> {
  const res = await fetch("/api/entries");
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export async function createEntry(amount: number, note: string): Promise<MoneyEntry> {
  const res = await fetch("/api/entries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, note }),
  });
  if (!res.ok) throw new Error("Failed to create");
  return res.json();
}

export async function removeEntry(id: string): Promise<void> {
  const res = await fetch(`/api/entries?id=${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete");
}

export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatShort(amount: number): string {
  if (amount >= 1_000_000_000) return (amount / 1_000_000_000).toFixed(2) + " tỷ";
  if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(1) + " tr";
  if (amount >= 1_000) return (amount / 1_000).toFixed(0) + "k";
  return amount.toString();
}

export function formatTime(ts: number): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ts));
}
