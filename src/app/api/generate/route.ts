import { generateStudyContent, isCursorConfigured } from "@/lib/cursor-agent";
import { isExamBoardId, sanitizeEdital } from "@/lib/exam";
import type { AgentStreamEvent, GenerateRequest, StudyLevel, StudyMode } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const modes: StudyMode[] = ["pack", "summary", "flashcards", "quiz"];
const levels: StudyLevel[] = ["beginner", "intermediate", "advanced"];

function encodeEvent(event: AgentStreamEvent) {
  return `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
}

function parseBody(value: unknown): GenerateRequest {
  if (typeof value !== "object" || value === null) {
    throw new Error("Pedido inválido.");
  }
  const body = value as Record<string, unknown>;
  const topic = typeof body.topic === "string" ? body.topic.trim() : "";
  const mode = body.mode as StudyMode;
  const level = body.level as StudyLevel;
  const banca = isExamBoardId(body.banca) ? body.banca : "generic";
  const concurso =
    typeof body.concurso === "string" ? body.concurso.trim() : "";
  const edital =
    typeof body.edital === "string" ? sanitizeEdital(body.edital) : "";
  if (topic.length < 3) {
    throw new Error("Descreva o assunto com pelo menos 3 caracteres.");
  }
  if (!modes.includes(mode)) {
    throw new Error("Modo de estudo inválido.");
  }
  if (!levels.includes(level)) {
    throw new Error("Nível inválido.");
  }
  return {
    topic,
    mode,
    level,
    banca,
    concurso: concurso || undefined,
    edital: edital || undefined,
  };
}

export async function POST(request: Request) {
  if (!isCursorConfigured()) {
    return Response.json(
      {
        message:
          "CURSOR_API_KEY não configurada. Adicione a chave em .env.local para o agente do Cursor gerar o conteúdo.",
      },
      { status: 503 },
    );
  }

  let input: GenerateRequest;
  try {
    input = parseBody(await request.json());
  } catch (error) {
    return Response.json(
      { message: error instanceof Error ? error.message : "Pedido inválido." },
      { status: 400 },
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: AgentStreamEvent) => {
        controller.enqueue(encoder.encode(encodeEvent(event)));
      };
      try {
        await generateStudyContent(input, send, request.signal);
        send({ type: "done" });
      } catch (error) {
        send({
          type: "error",
          message:
            error instanceof Error
              ? error.message
              : "Falha inesperada ao gerar o conteúdo.",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
