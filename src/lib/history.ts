import type { HistoryItem, StudyPack } from "./types";

const STORAGE_KEY = "aprendia.history.v1";
const MAX_ITEMS = 24;

function canUseStorage() {
  return typeof window !== "undefined";
}

export function loadHistory(): HistoryItem[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHistoryItem(pack: StudyPack): HistoryItem {
  const item: HistoryItem = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    topic: pack.topic,
    mode: pack.mode,
    level: pack.level,
    pack,
  };
  const next = [item, ...loadHistory()].slice(0, MAX_ITEMS);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return item;
}

export function deleteHistoryItem(id: string) {
  const next = loadHistory().filter((item) => item.id !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function clearHistory() {
  window.localStorage.removeItem(STORAGE_KEY);
}
