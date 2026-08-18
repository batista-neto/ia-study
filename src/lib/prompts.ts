import type { StudyLevel, StudyMode } from "./types";

const levelLabel: Record<StudyLevel, string> = {
  beginner: "iniciante (explique do zero, analogias simples)",
  intermediate: "intermediário (vá além do básico, conecte ideias)",
  advanced: "avançado (precisão técnica, nuances e casos-limite)",
};

const modeInstructions: Record<StudyMode, string> = {
  pack: `Gere um PACOTE COMPLETO de estudo com:
- summary: resumo estruturado
- flashcards: 10 a 14 cards
- quiz: 8 a 10 questões de múltipla escolha (4 alternativas cada)`,
  summary: "Gere APENAS o campo summary. Não invente flashcards nem quiz.",
  flashcards:
    "Gere APENAS o campo flashcards com 12 a 16 cards. Não invente summary nem quiz.",
  quiz: "Gere APENAS o campo quiz com 8 a 12 questões. Não invente summary nem flashcards.",
};

export function buildAgentPrompt(input: {
  topic: string;
  mode: StudyMode;
  level: StudyLevel;
}): string {
  return `Você é o agente de estudo da AprendIA. Seu único trabalho nesta execução é gerar material didático.

ASSUNTO: ${input.topic}
NÍVEL: ${levelLabel[input.level]}
MODO: ${input.mode}

${modeInstructions[input.mode]}

REGRAS OBRIGATÓRIAS:
1. NÃO use ferramentas de arquivo, terminal, busca ou edição. Não liste diretórios. Não escreva arquivos.
2. Entregue o resultado chamando a ferramenta customizada deliver_study_content UMA ÚNICA VEZ, com JSON válido.
3. Se por algum motivo não puder chamar a ferramenta, responda SOMENTE com um JSON (sem markdown, sem comentários).
4. Escreva em português brasileiro, a menos que o assunto exija termos em outro idioma.
5. Seja preciso, útil e específico. Evite enrolação e frases genéricas.
6. Em questões, exatamente uma alternativa correta. A explicação deve dizer por que a certa está certa e por que as outras falham.
7. Flashcards: frente curta (termo, pergunta ou conceito); verso completo o suficiente para estudar sozinho.

SCHEMA do JSON / da ferramenta:
{
  "topic": string,
  "mode": "${input.mode}",
  "level": "${input.level}",
  "summary?": {
    "title": string,
    "overview": string,
    "sections": [{ "heading": string, "content": string }],
    "keyTakeaways": string[]
  },
  "flashcards?": [{ "front": string, "back": string, "hint"?: string }],
  "quiz?": [{
    "question": string,
    "options": [string, string, string, string],
    "correctIndex": number,
    "explanation": string
  }]
}

Comece agora. Pense o conteúdo e entregue.`;
}
