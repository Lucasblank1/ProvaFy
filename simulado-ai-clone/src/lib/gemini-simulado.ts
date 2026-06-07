import { GoogleGenAI, Schema } from "@google/genai";

const MODELOS_FALLBACK = [
  "gemini-2.0-flash",
  "gemini-2.5-flash",
  "gemini-1.5-flash",
] as const;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function erroRecuperavel(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const err = error as { status?: number; message?: string };
  const msg = (err.message ?? "").toLowerCase();

  return (
    err.status === 503 ||
    err.status === 429 ||
    msg.includes("high demand") ||
    msg.includes("unavailable") ||
    msg.includes("resource exhausted") ||
    msg.includes("overloaded")
  );
}

export function mensagemErroGemini(error: unknown): string {
  if (!process.env.GEMINI_API_KEY?.trim()) {
    return "Chave da API Gemini não configurada. Defina GEMINI_API_KEY no arquivo .env.";
  }

  if (erroRecuperavel(error)) {
    return "O serviço de IA está temporariamente sobrecarregado. Aguarde alguns segundos e tente novamente.";
  }

  if (error && typeof error === "object") {
    const err = error as { status?: number; message?: string };
    if (err.status === 401 || err.status === 403) {
      return "Chave da API Gemini inválida ou sem permissão. Verifique GEMINI_API_KEY no .env.";
    }
  }

  return "Ocorreu um erro ao processar o texto e gerar o simulado. Tente novamente.";
}

interface GerarSimuladoParams {
  qtdQuestoes: number;
  contentText: string;
  cargoInstruction: string;
  bancaInstruction: string;
  responseSchema: Schema;
}

export async function gerarSimuladoComGemini({
  qtdQuestoes,
  contentText,
  cargoInstruction,
  bancaInstruction,
  responseSchema,
}: GerarSimuladoParams) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey });
  let ultimoErro: unknown;

  for (const model of MODELOS_FALLBACK) {
    for (let tentativa = 0; tentativa < 2; tentativa++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: `Gere ${qtdQuestoes} questões de múltipla escolha com base exclusivamente neste texto:\n\n${contentText}`,
          config: {
            systemInstruction: `Você é um experiente professor e elaborador de questões de concursos públicos. Sua tarefa é criar um simulado. ${cargoInstruction}${bancaInstruction}Gere o simulado APENAS com temas contidos no texto fornecido, sem inventar fatos ou regras externas que fujam ao material. Extraia interpretação, conceitos e detalhes dados pelo próprio texto, abordando-os com a complexidade solicitada.`,
            responseMimeType: "application/json",
            responseSchema,
            temperature: 0.2,
          },
        });

        if (!response.text) {
          throw new Error("A API não retornou nenhum conteúdo válido.");
        }

        return JSON.parse(response.text);
      } catch (error) {
        ultimoErro = error;
        console.error(
          `Falha ao gerar simulado (modelo: ${model}, tentativa: ${tentativa + 1}):`,
          error
        );

        if (erroRecuperavel(error) && tentativa === 0) {
          await sleep(2500);
          continue;
        }

        if (!erroRecuperavel(error)) {
          break;
        }
      }
    }
  }

  throw ultimoErro ?? new Error("Não foi possível gerar o simulado.");
}
