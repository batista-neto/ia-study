"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AgentLive } from "@/components/AgentLive";
import { FlashcardDeck } from "@/components/FlashcardDeck";
import { HistoryPanel } from "@/components/HistoryPanel";
import { QuizView } from "@/components/QuizView";
import { SummaryView } from "@/components/SummaryView";
import { TopicComposer } from "@/components/TopicComposer";
import { streamStudyContent } from "@/lib/generate-client";
import {
  deleteHistoryItem,
  loadHistory,
  saveHistoryItem,
} from "@/lib/history";
import type {
  HistoryItem,
  StudyLevel,
  StudyMode,
  StudyPack,
} from "@/lib/types";

type ResultTab = "summary" | "flashcards" | "quiz";

const tabLabel: Record<ResultTab, string> = {
  summary: "Resumo",
  flashcards: "Flashcards",
  quiz: "Questões",
};

function defaultTab(pack: StudyPack): ResultTab {
  if (pack.mode === "flashcards" && pack.flashcards?.length) return "flashcards";
  if (pack.mode === "quiz" && pack.quiz?.length) return "quiz";
  if (pack.summary) return "summary";
  if (pack.flashcards?.length) return "flashcards";
  return "quiz";
}

export function Studio() {
  const [topic, setTopic] = useState("");
  const [mode, setMode] = useState<StudyMode>("pack");
  const [level, setLevel] = useState<StudyLevel>("intermediate");
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("Pronto para gerar.");
  const [thinking, setThinking] = useState("");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pack, setPack] = useState<StudyPack | null>(null);
  const [tab, setTab] = useState<ResultTab>("summary");
  const [history, setHistory] = useState<HistoryItem[]>(() => loadHistory());
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data: { cursorConfigured?: boolean }) => {
        setConfigured(Boolean(data.cursorConfigured));
      })
      .catch(() => setConfigured(false));
  }, []);

  const availableTabs = useMemo(() => {
    if (!pack) return [];
    const tabs: ResultTab[] = [];
    if (pack.summary) tabs.push("summary");
    if (pack.flashcards?.length) tabs.push("flashcards");
    if (pack.quiz?.length) tabs.push("quiz");
    return tabs;
  }, [pack]);

  async function generate() {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setBusy(true);
    setError(null);
    setThinking("");
    setTranscript("");
    setStatus("Conectando ao agente do Cursor...");
    try {
      await streamStudyContent(
        { topic: topic.trim(), mode, level },
        (event) => {
          if (event.type === "status") setStatus(event.message);
          if (event.type === "thinking") {
            setThinking((current) => current + event.text);
          }
          if (event.type === "delta") {
            setTranscript((current) => current + event.text);
          }
          if (event.type === "tool") {
            setStatus(`Ferramenta ${event.name}: ${event.status}`);
          }
          if (event.type === "result") {
            setPack(event.pack);
            setTab(defaultTab(event.pack));
            const item = saveHistoryItem(event.pack);
            setHistory((current) => [
              item,
              ...current.filter((entry) => entry.id !== item.id),
            ]);
          }
        },
        controller.signal,
      );
      setStatus("Material pronto.");
    } catch (err) {
      if (controller.signal.aborted) {
        setStatus("Geração interrompida.");
      } else {
        const message =
          err instanceof Error ? err.message : "Falha ao gerar o conteúdo.";
        setError(message);
        setStatus("Algo deu errado.");
      }
    } finally {
      setBusy(false);
    }
  }

  function cancel() {
    abortRef.current?.abort();
    setBusy(false);
    setStatus("Geração interrompida.");
  }

  function openHistory(item: HistoryItem) {
    setPack(item.pack);
    setTopic(item.topic);
    setMode(item.mode);
    setLevel(item.level);
    setTab(defaultTab(item.pack));
    setError(null);
    setStatus("Sessão restaurada do histórico.");
  }

  return (
    <div className="relative min-h-screen">
      <div className="grain" />
      <header className="sticky top-0 z-20 border-b border-line/80 bg-ink/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold text-ink font-serif text-xl">
              A
            </div>
            <div>
              <p className="font-serif text-lg leading-none tracking-tight">
                AprendIA
              </p>
              <p className="mt-1 text-xs text-muted">
                Agente de estudo em tempo real
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted">
            <span
              className={`h-2 w-2 rounded-full ${configured ? "bg-teal live-dot" : "bg-rose"}`}
            />
            {configured === null
              ? "Checando o Cursor..."
              : configured
                ? "Cursor conectado"
                : "Chave do Cursor ausente"}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-6">
          <TopicComposer
            topic={topic}
            mode={mode}
            level={level}
            busy={busy}
            onTopic={setTopic}
            onMode={setMode}
            onLevel={setLevel}
            onGenerate={generate}
            onCancel={cancel}
          />

          {configured === false ? (
            <div className="rounded-2xl border border-rose/30 bg-rose/8 px-5 py-4 text-sm leading-6 text-cream/90">
              Para gerar conteúdo, crie um arquivo{" "}
              <code className="rounded bg-ink-3 px-1.5 py-0.5 font-mono text-gold">
                .env.local
              </code>{" "}
              com{" "}
              <code className="rounded bg-ink-3 px-1.5 py-0.5 font-mono text-gold">
                CURSOR_API_KEY
              </code>{" "}
              (Dashboard do Cursor → API Keys) e reinicie o servidor.
            </div>
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-rose/40 bg-rose/10 px-5 py-4 text-sm text-rose">
              {error}
            </div>
          ) : null}

          <AgentLive
            busy={busy}
            status={status}
            thinking={thinking}
            transcript={transcript}
          />

          {pack ? (
            <div className="overflow-hidden rounded-[28px] border border-line bg-ink-2/80 shadow-[0_20px_80px_rgba(0,0,0,0.28)]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">
                    Material gerado
                  </p>
                  <h2 className="font-serif text-2xl tracking-tight">
                    {pack.topic}
                  </h2>
                </div>
                <div className="flex rounded-full bg-ink p-1">
                  {availableTabs.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setTab(item)}
                      className={`rounded-full px-4 py-2 text-sm transition ${
                        tab === item
                          ? "bg-gold text-ink"
                          : "text-muted hover:text-cream"
                      }`}
                    >
                      {tabLabel[item]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-5 md:p-7">
                {tab === "summary" && pack.summary ? (
                  <SummaryView summary={pack.summary} />
                ) : null}
                {tab === "flashcards" && pack.flashcards ? (
                  <FlashcardDeck
                    key={`${pack.topic}-cards-${pack.flashcards.length}`}
                    cards={pack.flashcards}
                  />
                ) : null}
                {tab === "quiz" && pack.quiz ? (
                  <QuizView
                    key={`${pack.topic}-quiz-${pack.quiz.length}`}
                    questions={pack.quiz}
                  />
                ) : null}
              </div>
            </div>
          ) : (
            <EmptyState />
          )}
        </section>

        <HistoryPanel
          items={history}
          onOpen={openHistory}
          onDelete={(id) => {
            deleteHistoryItem(id);
            setHistory((current) => current.filter((item) => item.id !== id));
          }}
        />
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[28px] border border-dashed border-line px-6 py-16 text-center">
      <p className="text-xs uppercase tracking-[0.22em] text-gold-2">
        Estúdio de estudo
      </p>
      <h2 className="mx-auto mt-3 max-w-xl font-serif text-4xl leading-tight tracking-tight">
        Peça um assunto. O agente do Cursor monta o material na hora.
      </h2>
      <p className="mx-auto mt-4 max-w-lg text-muted">
        Resumos para revisar, flashcards para memorizar e questões para testar.
        Tudo gerado ao vivo, como uma conversa com o chat do Cursor.
      </p>
    </div>
  );
}
