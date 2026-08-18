"use client";

import type { SummaryContent } from "@/lib/types";

export function SummaryView({ summary }: { summary: SummaryContent }) {
  return (
    <article className="space-y-8">
      <header>
        <h3 className="font-serif text-4xl tracking-tight">{summary.title}</h3>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-cream/80">
          {summary.overview}
        </p>
      </header>
      {summary.keyTakeaways.length ? (
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-gold-2">
            Pontos-chave
          </p>
          <ul className="mt-3 grid gap-2 md:grid-cols-2">
            {summary.keyTakeaways.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-line bg-ink/50 px-4 py-3 text-sm leading-6"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="space-y-8">
        {summary.sections.map((section, index) => (
          <section key={`${section.heading}-${index}`}>
            <p className="font-mono text-xs text-gold">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h4 className="mt-1 font-serif text-2xl tracking-tight">
              {section.heading}
            </h4>
            <p className="mt-3 whitespace-pre-wrap leading-8 text-cream/80">
              {section.content}
            </p>
          </section>
        ))}
      </div>
    </article>
  );
}
