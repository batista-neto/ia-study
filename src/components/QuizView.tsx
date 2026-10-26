"use client";

import { useState } from "react";
import type { QuizQuestion } from "@/lib/types";

export function QuizView({ questions }: { questions: QuizQuestion[] }) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const question = questions[index];

  if (!question) return null;

  if (done) {
    return (
      <div className="py-10 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-gold-2">
          Resultado
        </p>
        <h3 className="mt-3 font-serif text-5xl tracking-tight">
          {score}/{questions.length}
        </h3>
        <p className="mt-3 text-muted">
          {score === questions.length
            ? "Tudo certo. Esse assunto está consolidado."
            : "Revise as explicações e tente de novo."}
        </p>
        <button
          type="button"
          onClick={() => {
            setIndex(0);
            setPicked(null);
            setScore(0);
            setDone(false);
          }}
          className="mt-6 rounded-full bg-gold px-5 py-3 text-sm text-ink"
        >
          Refazer questões
        </button>
      </div>
    );
  }

  const revealed = picked !== null;
  const correct = picked === question.correctIndex;
  const certoErrado =
    question.format === "certo-errado" || question.options.length === 2;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm text-muted">
        <span>
          {certoErrado ? "Item" : "Questão"} {index + 1} de {questions.length}
        </span>
        <span>Acertos: {score}</span>
      </div>
      <h3 className="font-serif text-3xl tracking-tight">{question.question}</h3>
      <div className={`grid gap-2 ${certoErrado ? "sm:grid-cols-2" : ""}`}>
        {question.options.map((option, optionIndex) => {
          const isCorrect = optionIndex === question.correctIndex;
          const isPicked = optionIndex === picked;
          let className = "border-line bg-ink/40 hover:border-cream/20";
          if (revealed && isCorrect) className = "border-teal bg-teal/10";
          if (revealed && isPicked && !isCorrect) className = "border-rose bg-rose/10";
          const label = certoErrado
            ? optionIndex === 0
              ? "C"
              : "E"
            : String.fromCharCode(65 + optionIndex);
          return (
            <button
              key={`${optionIndex}-${option}`}
              type="button"
              disabled={revealed}
              onClick={() => {
                setPicked(optionIndex);
                if (optionIndex === question.correctIndex) {
                  setScore((value) => value + 1);
                }
              }}
              className={`rounded-2xl border px-4 py-3 text-left text-sm leading-6 transition ${className}`}
            >
              <span className="mr-3 font-mono text-xs text-muted">
                {label}
              </span>
              {option}
            </button>
          );
        })}
      </div>
      {revealed ? (
        <div className="rounded-2xl border border-line bg-ink/50 px-4 py-4 text-sm leading-6 text-cream/80">
          <p className={correct ? "text-teal" : "text-rose"}>
            {correct ? "Resposta correta." : "Resposta incorreta."}
          </p>
          <p className="mt-2">{question.explanation}</p>
          <button
            type="button"
            onClick={() => {
              if (index + 1 >= questions.length) {
                setDone(true);
                return;
              }
              setIndex((value) => value + 1);
              setPicked(null);
            }}
            className="mt-4 rounded-full bg-cream px-4 py-2 text-sm text-ink"
          >
            {index + 1 >= questions.length ? "Ver resultado" : "Próxima questão"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
