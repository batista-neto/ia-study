import type { ExamBoardId } from "./exam";

export type StudyMode = "pack" | "summary" | "flashcards" | "quiz";
export type StudyLevel = "beginner" | "intermediate" | "advanced";
export type QuizFormat = "multiple-choice" | "certo-errado";

export type SummarySection = {
  heading: string;
  content: string;
};

export type SummaryContent = {
  title: string;
  overview: string;
  sections: SummarySection[];
  keyTakeaways: string[];
  editalTopics?: string[];
};

export type Flashcard = {
  front: string;
  back: string;
  hint?: string;
};

export type QuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  format?: QuizFormat;
};

export type StudyPack = {
  topic: string;
  mode: StudyMode;
  level: StudyLevel;
  banca: ExamBoardId;
  concurso?: string;
  edital?: string;
  summary?: SummaryContent;
  flashcards?: Flashcard[];
  quiz?: QuizQuestion[];
};

export type GenerateRequest = {
  topic: string;
  mode: StudyMode;
  level: StudyLevel;
  banca: ExamBoardId;
  concurso?: string;
  edital?: string;
};

export type AgentStreamEvent =
  | { type: "status"; stage: string; message: string }
  | { type: "thinking"; text: string }
  | { type: "delta"; text: string }
  | { type: "tool"; name: string; status: string }
  | { type: "result"; pack: StudyPack }
  | { type: "error"; message: string }
  | { type: "done" };

export type HistoryItem = {
  id: string;
  createdAt: number;
  topic: string;
  mode: StudyMode;
  level: StudyLevel;
  pack: StudyPack;
};
