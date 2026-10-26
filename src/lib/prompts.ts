import { getExamBoard } from "./exam";
import type { GenerateRequest, StudyLevel, StudyMode } from "./types";

const levelLabel: Record<StudyLevel, string> = {
  beginner: "iniciante (explique do zero, analogias simples)",
  intermediate: "intermediário (vá além do básico, conecte ideias)",
  advanced: "avançado (precisão técnica, nuances e casos-limite)",
};

function modeInstructions(mode: StudyMode, optionCount: number, format: string) {
  const quizLine =
    format === "certo-errado"
      ? "quiz: gere quantos itens forem necessários para cobrir o assunto e o edital, sem teto de quantidade. Formato Certo/Errado (options exatamente [\"Certo\", \"Errado\"], format: \"certo-errado\")"
      : `quiz: gere quantas questões forem necessárias para cobrir o assunto e o edital, sem teto de quantidade. Múltipla escolha com ${optionCount} alternativas cada (format: "multiple-choice")`;

  const map: Record<StudyMode, string> = {
    pack: `Gere um PACOTE COMPLETO de estudo com:
- summary: resumo estruturado, alinhado ao edital quando houver
- flashcards: 10 a 14 cards
- ${quizLine}`,
    summary:
      "Gere APENAS o campo summary. Não invente flashcards nem quiz.",
    flashcards:
      "Gere APENAS o campo flashcards com 12 a 16 cards. Não invente summary nem quiz.",
    quiz: `Gere APENAS o campo quiz. ${quizLine}. Não invente summary nem flashcards.`,
  };
  return map[mode];
}

export function buildAgentPrompt(input: GenerateRequest): string {
  const board = getExamBoard(input.banca);
  const concurso = input.concurso?.trim();
  const edital = input.edital?.trim();

  const contestBlock = [
    `BANCA: ${board.label} (id: ${board.id})`,
    `ESTILO DA BANCA: ${board.style}`,
    concurso ? `CONCURSO / CARGO: ${concurso}` : "CONCURSO / CARGO: não informado",
    edital
      ? `EDITAL (trecho colado pelo usuário — trate como fonte da verdade para o recorte do assunto):\n"""\n${edital}\n"""`
      : "EDITAL: não informado. Cubra o assunto de forma útil para concurso, sem inventar tópicos de um edital específico.",
  ].join("\n");

  return `Você é o agente de estudo da AprendIA, especializado em concursos públicos brasileiros. Seu único trabalho nesta execução é gerar material didático.

ASSUNTO: ${input.topic}
NÍVEL: ${levelLabel[input.level]}
MODO: ${input.mode}
${contestBlock}

${modeInstructions(input.mode, board.optionCount, board.format)}

REGRAS OBRIGATÓRIAS:
1. NÃO use ferramentas de arquivo, terminal, busca ou edição. Não liste diretórios. Não escreva arquivos.
2. Entregue o resultado chamando a ferramenta customizada deliver_study_content UMA ÚNICA VEZ, com JSON válido.
3. Se por algum motivo não puder chamar a ferramenta, responda SOMENTE com um JSON (sem markdown, sem comentários).
4. Escreva em português brasileiro, a menos que o assunto exija termos em outro idioma.
5. Seja preciso, útil e específico. Evite enrolação e frases genéricas.
6. Se houver edital, recorte o conteúdo pelo que o edital pede sobre o assunto. Não invente tópicos fora do recorte. Preencha summary.editalTopics com os pontos do edital efetivamente cobertos.
7. Siga o ESTILO DA BANCA nas questões: quantidade de alternativas, formato certo/errado quando for Cebraspe, pegadinhas e tom típicos.
8. Em questões, exatamente uma alternativa correta. A explicação deve dizer por que a certa está certa e por que as outras falham (ou, no certo/errado, onde o item acerta ou erra). Não há limite máximo de questões: cubra o recorte com a quantidade que o conteúdo exigir.
9. Flashcards: frente curta (termo, pergunta ou conceito); verso completo o suficiente para estudar sozinho. Quando houver banca, use vocabulário de prova.
10. NÃO monte cronograma, carga horária nem plano de dias. Só conteúdo de estudo.

SCHEMA do JSON / da ferramenta:
{
  "topic": string,
  "mode": "${input.mode}",
  "level": "${input.level}",
  "banca": "${input.banca}",
  "concurso?": string,
  "summary?": {
    "title": string,
    "overview": string,
    "sections": [{ "heading": string, "content": string }],
    "keyTakeaways": string[],
    "editalTopics?": string[]
  },
  "flashcards?": [{ "front": string, "back": string, "hint"?: string }],
  "quiz?": [{
    "question": string,
    "options": string[],
    "correctIndex": number,
    "explanation": string,
    "format": "${board.format}"
  }]
}

Comece agora. Pense o conteúdo e entregue.`;
}
