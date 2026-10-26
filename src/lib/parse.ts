import { isExamBoardId } from "./exam";
import type {
  Flashcard,
  GenerateRequest,
  QuizFormat,
  QuizQuestion,
  StudyLevel,
  StudyMode,
  StudyPack,
  SummaryContent,
} from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fence ? fence[1].trim() : trimmed;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("O agente não devolveu JSON válido.");
  }
  return JSON.parse(raw.slice(start, end + 1));
}

function parseSummary(value: unknown): SummaryContent | undefined {
  if (!isRecord(value)) return undefined;
  const sectionsRaw = Array.isArray(value.sections) ? value.sections : [];
  const takeawaysRaw = Array.isArray(value.keyTakeaways)
    ? value.keyTakeaways
    : [];
  const sections = sectionsRaw
    .filter(isRecord)
    .map((section) => ({
      heading: asString(section.heading),
      content: asString(section.content),
    }))
    .filter((section) => section.heading && section.content);
  const keyTakeaways = takeawaysRaw
    .map((item) => asString(item))
    .filter(Boolean);
  const title = asString(value.title);
  const overview = asString(value.overview);
  if (!title || !overview) return undefined;
  const editalRaw = Array.isArray(value.editalTopics) ? value.editalTopics : [];
  const editalTopics = editalRaw.map((item) => asString(item)).filter(Boolean);
  return {
    title,
    overview,
    sections,
    keyTakeaways,
    editalTopics: editalTopics.length ? editalTopics : undefined,
  };
}

function parseFlashcards(value: unknown): Flashcard[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const cards = value
    .filter(isRecord)
    .map((card) => ({
      front: asString(card.front),
      back: asString(card.back),
      hint: asString(card.hint) || undefined,
    }))
    .filter((card) => card.front && card.back);
  return cards.length ? cards : undefined;
}

function parseQuiz(value: unknown): QuizQuestion[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const questions = value
    .filter(isRecord)
    .map((item) => {
      const options = Array.isArray(item.options)
        ? item.options.map((option) => asString(option)).filter(Boolean)
        : [];
      const format =
        item.format === "certo-errado" ||
        (options.length === 2 &&
          /^certo$/i.test(options[0] ?? "") &&
          /^errado$/i.test(options[1] ?? ""))
          ? "certo-errado"
          : "multiple-choice";
      return {
        question: asString(item.question),
        options,
        correctIndex: asNumber(item.correctIndex, 0),
        explanation: asString(item.explanation),
        format: format as QuizFormat,
      };
    })
    .filter(
      (item) =>
        item.question &&
        item.options.length >= 2 &&
        item.correctIndex >= 0 &&
        item.correctIndex < item.options.length,
    );
  return questions.length ? questions : undefined;
}

const modes: StudyMode[] = ["pack", "summary", "flashcards", "quiz"];
const levels: StudyLevel[] = ["beginner", "intermediate", "advanced"];

export function normalizeStudyPack(
  value: unknown,
  fallback: GenerateRequest,
): StudyPack {
  const record = isRecord(value) ? value : {};
  const mode = modes.includes(record.mode as StudyMode)
    ? (record.mode as StudyMode)
    : fallback.mode;
  const level = levels.includes(record.level as StudyLevel)
    ? (record.level as StudyLevel)
    : fallback.level;
  const pack: StudyPack = {
    topic: asString(record.topic, fallback.topic) || fallback.topic,
    mode,
    level,
    banca: isExamBoardId(record.banca) ? record.banca : fallback.banca,
    concurso:
      asString(record.concurso, fallback.concurso ?? "") ||
      fallback.concurso ||
      undefined,
    edital: fallback.edital || undefined,
    summary: parseSummary(record.summary),
    flashcards: parseFlashcards(record.flashcards),
    quiz: parseQuiz(record.quiz),
  };

  const hasContent = Boolean(
    pack.summary || pack.flashcards?.length || pack.quiz?.length,
  );
  if (!hasContent) {
    throw new Error(
      "O agente respondeu, mas o conteúdo gerado veio vazio ou em formato inesperado.",
    );
  }
  return pack;
}
