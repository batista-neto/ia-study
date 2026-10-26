"use client";

import { EDITAL_MAX_CHARS, EXAM_BOARDS } from "@/lib/exam";
import type { ExamBoardId } from "@/lib/exam";
import type { StudyLevel, StudyMode } from "@/lib/types";

const modes: { id: StudyMode; label: string; hint: string }[] = [
  { id: "pack", label: "Pacote completo", hint: "Os três juntos" },
  { id: "summary", label: "Resumo", hint: "Explicação estruturada" },
  { id: "flashcards", label: "Flashcards", hint: "Memorização ativa" },
  { id: "quiz", label: "Questões", hint: "Estilo da banca" },
];

const levels: { id: StudyLevel; label: string }[] = [
  { id: "beginner", label: "Iniciante" },
  { id: "intermediate", label: "Intermediário" },
  { id: "advanced", label: "Avançado" },
];

type Props = {
  topic: string;
  mode: StudyMode;
  level: StudyLevel;
  banca: ExamBoardId;
  concurso: string;
  edital: string;
  busy: boolean;
  onTopic: (value: string) => void;
  onMode: (value: StudyMode) => void;
  onLevel: (value: StudyLevel) => void;
  onBanca: (value: ExamBoardId) => void;
  onConcurso: (value: string) => void;
  onEdital: (value: string) => void;
  onGenerate: () => void;
  onCancel: () => void;
};

export function TopicComposer({
  topic,
  mode,
  level,
  banca,
  concurso,
  edital,
  busy,
  onTopic,
  onMode,
  onLevel,
  onBanca,
  onConcurso,
  onEdital,
  onGenerate,
  onCancel,
}: Props) {
  return (
    <div className="rounded-[28px] border border-line bg-ink-2/90 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.25)] md:p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-muted">
        O que você quer estudar?
      </p>
      <textarea
        value={topic}
        onChange={(event) => onTopic(event.target.value)}
        placeholder="Ex.: princípios da administração pública, crimes contra a fé pública, raciocínio lógico..."
        rows={3}
        className="mt-3 w-full resize-none bg-transparent font-serif text-2xl leading-snug tracking-tight text-cream outline-none placeholder:text-muted/50 md:text-3xl"
      />

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.16em] text-muted">
            Concurso
          </span>
          <input
            value={concurso}
            onChange={(event) => onConcurso(event.target.value)}
            placeholder="Ex.: Receita Federal, TCU, PF"
            className="mt-2 w-full rounded-2xl border border-line bg-ink/50 px-4 py-3 text-sm outline-none placeholder:text-muted/60 focus:border-gold/50"
          />
        </label>
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted">
            Banca
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {EXAM_BOARDS.map((board) => (
              <button
                key={board.id}
                type="button"
                onClick={() => onBanca(board.id)}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  banca === board.id
                    ? "border-gold bg-gold/15 text-cream"
                    : "border-line bg-ink/40 text-muted hover:text-cream"
                }`}
              >
                {board.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <label className="mt-5 block">
        <span className="flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-muted">
          <span>Edital</span>
          <span>
            {edital.length}/{EDITAL_MAX_CHARS}
          </span>
        </span>
        <textarea
          value={edital}
          onChange={(event) => onEdital(event.target.value.slice(0, EDITAL_MAX_CHARS))}
          placeholder="Cole aqui o trecho do edital (conteúdo programático da disciplina). O agente recorta o assunto por esse texto."
          rows={5}
          className="mt-2 w-full resize-y rounded-2xl border border-line bg-ink/50 px-4 py-3 text-sm leading-6 outline-none placeholder:text-muted/60 focus:border-gold/50"
        />
      </label>

      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {modes.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onMode(item.id)}
            className={`rounded-2xl border px-4 py-3 text-left transition ${
              mode === item.id
                ? "border-gold bg-gold/10"
                : "border-line bg-ink/40 hover:border-cream/20"
            }`}
          >
            <span className="block text-sm">{item.label}</span>
            <span className="mt-1 block text-xs text-muted">{item.hint}</span>
          </button>
        ))}
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex rounded-full bg-ink p-1">
          {levels.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onLevel(item.id)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                level === item.id
                  ? "bg-cream text-ink"
                  : "text-muted hover:text-cream"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {busy ? (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-line px-5 py-3 text-sm text-muted hover:text-cream"
            >
              Parar
            </button>
          ) : null}
          <button
            type="button"
            disabled={busy || topic.trim().length < 3}
            onClick={onGenerate}
            className="rounded-full bg-gold px-6 py-3 text-sm font-medium text-ink transition hover:bg-gold-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? "Gerando com o agente..." : "Gerar agora"}
          </button>
        </div>
      </div>
    </div>
  );
}
