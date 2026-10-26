import { mkdir } from "node:fs/promises";
import path from "node:path";
import {
  Agent,
  ConfigurationError,
  CursorAgentError,
  type SDKJsonValue,
} from "@cursor/sdk";
import { extractJsonObject, normalizeStudyPack } from "./parse";
import { buildAgentPrompt } from "./prompts";
import type {
  AgentStreamEvent,
  GenerateRequest,
  StudyPack,
} from "./types";

const WORKSPACE_DIR = path.join(process.cwd(), ".agent-workspace");

const studyContentSchema = {
  type: "object",
  additionalProperties: false,
  required: ["topic", "mode", "level"],
  properties: {
    topic: { type: "string" },
    mode: { type: "string", enum: ["pack", "summary", "flashcards", "quiz"] },
    level: {
      type: "string",
      enum: ["beginner", "intermediate", "advanced"],
    },
    banca: { type: "string" },
    concurso: { type: "string" },
    summary: {
      type: "object",
      properties: {
        title: { type: "string" },
        overview: { type: "string" },
        sections: {
          type: "array",
          items: {
            type: "object",
            properties: {
              heading: { type: "string" },
              content: { type: "string" },
            },
            required: ["heading", "content"],
          },
        },
        keyTakeaways: { type: "array", items: { type: "string" } },
        editalTopics: { type: "array", items: { type: "string" } },
      },
      required: ["title", "overview", "sections", "keyTakeaways"],
    },
    flashcards: {
      type: "array",
      items: {
        type: "object",
        properties: {
          front: { type: "string" },
          back: { type: "string" },
          hint: { type: "string" },
        },
        required: ["front", "back"],
      },
    },
    quiz: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          options: { type: "array", items: { type: "string" } },
          correctIndex: { type: "integer" },
          explanation: { type: "string" },
          format: {
            type: "string",
            enum: ["multiple-choice", "certo-errado"],
          },
        },
        required: ["question", "options", "correctIndex", "explanation"],
      },
    },
  },
};

function requireApiKey() {
  const apiKey = process.env.CURSOR_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "CURSOR_API_KEY não configurada. Crie um arquivo .env.local com a chave do Cursor Dashboard → API Keys.",
    );
  }
  return apiKey;
}

export async function generateStudyContent(
  input: GenerateRequest,
  onEvent: (event: AgentStreamEvent) => void,
  signal?: AbortSignal,
): Promise<StudyPack> {
  const apiKey = requireApiKey();
  const modelId = process.env.CURSOR_MODEL?.trim() || "composer-2.5";
  await mkdir(WORKSPACE_DIR, { recursive: true });

  let delivered: unknown;
  const localOptions = {
    cwd: WORKSPACE_DIR,
    settingSources: [],
    customTools: {
      deliver_study_content: {
        description:
          "Entrega o material de estudo gerado (resumo, flashcards e/ou questões) em JSON estruturado. Chame uma única vez quando o conteúdo estiver pronto.",
        inputSchema: studyContentSchema as Record<string, SDKJsonValue>,
        execute: (args: Record<string, SDKJsonValue>) => {
          delivered = args;
          onEvent({
            type: "status",
            stage: "deliver",
            message: "Conteúdo estruturado recebido do agente.",
          });
          return "Conteúdo recebido com sucesso. Não chame outras ferramentas. Encerre a execução.";
        },
      },
    },
  };

  onEvent({
    type: "status",
    stage: "boot",
    message: "Acionando o agente do Cursor...",
  });

  const createAgent = async (sandboxEnabled: boolean) =>
    Agent.create({
      apiKey,
      model: { id: modelId },
      local: {
        ...localOptions,
        sandboxOptions: { enabled: sandboxEnabled },
      },
    });

  let agent;
  try {
    agent = await createAgent(true);
  } catch (error) {
    if (error instanceof ConfigurationError) {
      onEvent({
        type: "status",
        stage: "boot",
        message: "Sandbox indisponível neste ambiente. Seguindo sem sandbox.",
      });
      agent = await createAgent(false);
    } else {
      throw error;
    }
  }

  try {
    if (signal?.aborted) {
      throw new Error("Geração cancelada.");
    }

    onEvent({
      type: "status",
      stage: "run",
      message: "O agente está gerando o material em tempo real.",
    });

    const run = await agent.send(buildAgentPrompt(input), {
      onDelta: ({ update }) => {
        if (update.type === "text-delta" && "text" in update) {
          onEvent({ type: "delta", text: String(update.text ?? "") });
        }
        if (update.type === "thinking-delta" && "text" in update) {
          onEvent({ type: "thinking", text: String(update.text ?? "") });
        }
      },
    });

    const abort = async () => {
      if (run.supports("cancel")) {
        await run.cancel();
      }
    };

    signal?.addEventListener("abort", () => {
      void abort();
    });

    if (run.supports("stream")) {
      for await (const event of run.stream()) {
        if (signal?.aborted) break;
        if (event.type === "tool_call") {
          onEvent({
            type: "tool",
            name: event.name,
            status: event.status,
          });
        }
        if (event.type === "status") {
          onEvent({
            type: "status",
            stage: event.status,
            message: event.message || `Status do agente: ${event.status}`,
          });
        }
      }
    }

    const result = await run.wait();
    if (signal?.aborted) {
      throw new Error("Geração cancelada.");
    }
    if (result.status === "cancelled") {
      throw new Error("Geração cancelada.");
    }
    if (result.status === "error") {
      throw new Error(
        result.error?.message || "O agente do Cursor falhou no meio da geração.",
      );
    }

    const raw = delivered ?? extractJsonObject(result.result ?? "");
    const pack = normalizeStudyPack(raw, input);
    onEvent({ type: "result", pack });
    return pack;
  } catch (error) {
    if (error instanceof CursorAgentError) {
      throw new Error(
        `Não foi possível iniciar o agente do Cursor: ${error.message}`,
      );
    }
    throw error;
  } finally {
    agent.close();
  }
}

export function isCursorConfigured() {
  return Boolean(process.env.CURSOR_API_KEY?.trim());
}
