"use client";

import { useEffect, useState } from "react";
import type { Flashcard } from "@/lib/types";

export function FlashcardDeck({ cards }: { cards: Flashcard[] }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());
  const card = cards[index];

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        setFlipped((value) => !value);
      }
      if (event.key === "ArrowRight") {
        setFlipped(false);
        setIndex((value) => Math.min(cards.length - 1, value + 1));
      }
      if (event.key === "ArrowLeft") {
        setFlipped(false);
        setIndex((value) => Math.max(0, value - 1));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cards.length]);

  function next() {
    setFlipped(false);
    setIndex((value) => Math.min(cards.length - 1, value + 1));
  }

  function prev() {
    setFlipped(false);
    setIndex((value) => Math.max(0, value - 1));
  }

  if (!card) return null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-sm text-muted">
        <span>
          Card {index + 1} de {cards.length}
        </span>
        <span>{known.size} marcados como sabidos</span>
      </div>
      <button
        type="button"
        onClick={() => setFlipped((value) => !value)}
        className="block w-full [perspective:1200px]"
      >
        <div className={`relative h-72 flash-card ${flipped ? "is-flipped" : ""}`}>
          <div className="flash-face absolute inset-0 rounded-[28px] border border-line bg-gradient-to-br from-ink-3 to-ink p-8 text-left">
            <p className="text-xs uppercase tracking-[0.18em] text-gold-2">
              Frente
            </p>
            <p className="mt-6 font-serif text-3xl leading-tight tracking-tight">
              {card.front}
            </p>
            {card.hint ? (
              <p className="absolute bottom-6 left-8 right-8 text-sm text-muted">
                Dica: {card.hint}
              </p>
            ) : null}
          </div>
          <div className="flash-face flash-back absolute inset-0 rounded-[28px] border border-gold/30 bg-gold/10 p-8 text-left">
            <p className="text-xs uppercase tracking-[0.18em] text-gold">
              Verso
            </p>
            <p className="mt-6 text-lg leading-8 text-cream/90">{card.back}</p>
          </div>
        </div>
      </button>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={prev}
            className="rounded-full border border-line px-4 py-2 text-sm text-muted hover:text-cream"
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={next}
            className="rounded-full border border-line px-4 py-2 text-sm text-muted hover:text-cream"
          >
            Próximo
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            setKnown((current) => new Set(current).add(index));
            next();
          }}
          className="rounded-full bg-teal px-4 py-2 text-sm text-ink"
        >
          Eu sei este
        </button>
      </div>
    </div>
  );
}
