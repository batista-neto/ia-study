export const EXAM_BOARDS = [
  {
    id: "generic",
    label: "Sem banca",
    hint: "Estudo livre",
    optionCount: 4,
    format: "multiple-choice",
    style:
      "Questões de múltipla escolha com 4 alternativas. Linguagem clara, uma correta e distratores plausíveis.",
  },
  {
    id: "cebraspe",
    label: "Cebraspe (CESPE)",
    hint: "Certo ou errado",
    optionCount: 2,
    format: "certo-errado",
    style:
      "Formato CERTO/ERRADO. Cada item é uma afirmação curta. Use pegadinhas clássicas (sempre, nunca, apenas, somente, exclusivo). Cobre literalidade de lei, súmula e jurisprudência consolidada do STF/STJ quando couber. As opções DEVEM ser exatamente [\"Certo\", \"Errado\"].",
  },
  {
    id: "fcc",
    label: "FCC",
    hint: "Múltipla escolha",
    optionCount: 4,
    format: "multiple-choice",
    style:
      "Múltipla escolha com 4 alternativas (A–D). Estilo Fundação Carlos Chagas: lei seca, doutrina clássica, enunciado objetivo, pouco caso concreto.",
  },
  {
    id: "fgv",
    label: "FGV",
    hint: "5 alternativas",
    optionCount: 5,
    format: "multiple-choice",
    style:
      "Múltipla escolha com 5 alternativas (A–E). Estilo FGV: interpretação, situação-problema, atualidade e distinções finas entre alternativas próximas.",
  },
  {
    id: "vunesp",
    label: "VUNESP",
    hint: "Objetiva",
    optionCount: 4,
    format: "multiple-choice",
    style:
      "Múltipla escolha com 4 alternativas. Estilo VUNESP: enunciado direto, lei + jurisprudência consolidada, alternativas curtas.",
  },
  {
    id: "cesgranrio",
    label: "Cesgranrio",
    hint: "Técnica",
    optionCount: 5,
    format: "multiple-choice",
    style:
      "Múltipla escolha com 5 alternativas. Estilo Cesgranrio: precisão técnica, normas e procedimentos, pouco blá-blá.",
  },
  {
    id: "ibfc",
    label: "IBFC",
    hint: "Objetiva",
    optionCount: 4,
    format: "multiple-choice",
    style:
      "Múltipla escolha com 4 alternativas. Estilo IBFC: lei seca e conceitos de manual, enunciado curto.",
  },
  {
    id: "iades",
    label: "IADES",
    hint: "Objetiva",
    optionCount: 4,
    format: "multiple-choice",
    style:
      "Múltipla escolha com 4 alternativas. Estilo IADES: legislação e doutrina, com alguma pegadinha de literalidade.",
  },
  {
    id: "aocp",
    label: "AOCP",
    hint: "Objetiva",
    optionCount: 4,
    format: "multiple-choice",
    style:
      "Múltipla escolha com 4 alternativas. Estilo AOCP: objetiva, legislação e conhecimentos específicos do cargo quando o edital indicar.",
  },
  {
    id: "consulplan",
    label: "Consulplan",
    hint: "Objetiva",
    optionCount: 4,
    format: "multiple-choice",
    style:
      "Múltipla escolha com 4 alternativas. Estilo Consulplan: direta, com foco em legislação e conceitos cobrados em edital.",
  },
  {
    id: "quadrix",
    label: "Quadrix",
    hint: "Objetiva",
    optionCount: 4,
    format: "multiple-choice",
    style:
      "Múltipla escolha com 4 alternativas. Estilo Quadrix: lei, regimento e conhecimentos específicos descritos no edital.",
  },
] as const;

export type ExamBoardId = (typeof EXAM_BOARDS)[number]["id"];

export const EXAM_BOARD_IDS = EXAM_BOARDS.map((board) => board.id);

export const EDITAL_MAX_CHARS = 20_000;

export function isExamBoardId(value: unknown): value is ExamBoardId {
  return (
    typeof value === "string" &&
    EXAM_BOARD_IDS.includes(value as ExamBoardId)
  );
}

export function getExamBoard(id: ExamBoardId = "generic") {
  return EXAM_BOARDS.find((board) => board.id === id) ?? EXAM_BOARDS[0];
}

export function sanitizeEdital(value: string) {
  return value.trim().slice(0, EDITAL_MAX_CHARS);
}
