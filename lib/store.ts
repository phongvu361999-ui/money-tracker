export interface MoneyEntry {
  id: string;
  amount: number;
  note: string;
  timestamp: number; // Unix ms
}

const KEY = "money_entries";

export function getEntries(): MoneyEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function addEntry(amount: number, note: string): MoneyEntry {
  const entry: MoneyEntry = {
    id: Date.now().toString(),
    amount,
    note,
    timestamp: Date.now(),
  };
  const entries = getEntries();
  entries.push(entry);
  localStorage.setItem(KEY, JSON.stringify(entries));
  return entry;
}

export function deleteEntry(id: string): void {
  const entries = getEntries().filter((e) => e.id !== id);
  localStorage.setItem(KEY, JSON.stringify(entries));
}

export function getLatestAmount(): number {
  const entries = getEntries();
  if (entries.length === 0) return 0;
  return entries[entries.length - 1].amount;
}

export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
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
