"use client";

import type { HistoryItem } from "@/lib/types";

const modeLabel = {
  pack: "Pacote",
  summary: "Resumo",
  flashcards: "Flashcards",
  quiz: "Questões",
} as const;

export function HistoryPanel({
  items,
  onOpen,
  onDelete,
}: {
  items: HistoryItem[];
  onOpen: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <aside className="h-fit rounded-[28px] border border-line bg-ink-2/70 p-5 lg:sticky lg:top-24">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">Histórico</p>
      <h2 className="mt-1 font-serif text-2xl tracking-tight">Sessões</h2>
      {items.length === 0 ? (
        <p className="mt-4 text-sm leading-6 text-muted">
          Os materiais gerados ficam salvos neste navegador para você reabrir
          depois.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="group rounded-2xl border border-line bg-ink/40 p-3"
            >
              <button
                type="button"
                onClick={() => onOpen(item)}
                className="w-full text-left"
              >
                <p className="line-clamp-2 text-sm">{item.topic}</p>
                <p className="mt-1 text-xs text-muted">
                  {modeLabel[item.mode]} ·{" "}
                  {new Date(item.createdAt).toLocaleString("pt-BR")}
                </p>
              </button>
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                className="mt-2 text-xs text-muted hover:text-rose"
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
