import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

// Simple file-based storage for development
// On Vercel, use environment variable DATA_FILE or fall back to project root
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const DATA_FILE = process.env.DATA_FILE || path.join(DATA_DIR, "money_entries.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface MoneyEntry {
  id: string;
  amount: number;
  note: string;
  timestamp: number;
}

function readEntries(): MoneyEntry[] {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeEntries(entries: MoneyEntry[]): void {
  // Ensure directory exists before writing
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(entries, null, 2));
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    const entries = readEntries();
    return res.status(200).json(entries);
  }

  if (req.method === "POST") {
    const { amount, note } = req.body;
    if (typeof amount !== "number" || amount < 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }
    const entry: MoneyEntry = {
      id: Date.now().toString(),
      amount,
      note: note || "",
      timestamp: Date.now(),
    };
    const entries = readEntries();
    entries.push(entry);
    writeEntries(entries);
    return res.status(201).json(entry);
  }

  if (req.method === "DELETE") {
    const { id } = req.query;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Missing id" });
    }
    const entries = readEntries().filter((e) => e.id !== id);
    writeEntries(entries);
    return res.status(200).json({ ok: true });
  }

  res.status(405).json({ error: "Method not allowed" });
}
