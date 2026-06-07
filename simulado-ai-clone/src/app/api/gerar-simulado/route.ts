import { NextRequest, NextResponse } from "next/server";
import { Type, Schema } from "@google/genai";
import {
  gerarSimuladoComGemini,
  mensagemErroGemini,
} from "@/lib/gemini-simulado";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    let contentText = formData.get("text") as string | null;
    const file = formData.get("file") as File | null;
    const qtdQuestoesRaw = formData.get("qtdQuestoes") as string | null;
    const cargo = formData.get("cargo") as string | null;
    const banca = formData.get("banca") as string | null;

    const qtdQuestoes = qtdQuestoesRaw ? parseInt(qtdQuestoesRaw, 10) : 5;

    if (file && file.name.endsWith(".pdf")) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const pdfParse = require("pdf-parse");

      const pdfData = await pdfParse(buffer);
      contentText = pdfData.text;
    }

    if (!contentText || contentText.trim() === "") {
      return NextResponse.json(
        { error: "Nenhum conteúdo válido (texto ou arquivo PDF) foi fornecido." },
        { status: 400 }
      );
    }

    const responseSchema: Schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: {
            type: Type.INTEGER,
          },
          enunciado: {
            type: Type.STRING,
          },
          alternativas: {
            type: Type.OBJECT,
            properties: {
              A: { type: Type.STRING },
              B: { type: Type.STRING },
              C: { type: Type.STRING },
              D: { type: Type.STRING },
              E: { type: Type.STRING },
            },
            required: ["A", "B", "C", "D", "E"],
          },
          resposta_correta: {
            type: Type.STRING,
            description:
              "Apenas a letra correspondente à resposta correta. Exemplo: 'A', 'B', 'C', 'D' ou 'E'",
          },
          explicacao: {
            type: Type.STRING,
          },
        },
        required: [
          "id",
          "enunciado",
          "alternativas",
          "resposta_correta",
          "explicacao",
        ],
      },
    };

    const cargoInstruction = cargo
      ? `O público-alvo deste simulado são candidatos ao cargo de "${cargo}". Adapte o nível de dificuldade, a linguagem e a abordagem das questões para o padrão esperado para este cargo. `
      : "";
    const bancaInstruction = banca
      ? `A banca organizadora do concurso é a "${banca}". Baseie-se fortemente no estilo, nas "pegadinhas" tradicionais e na forma de cobrar (textos longos, jurisprudência, literalidade da lei, modelo de múltipla escolha) características exclusivas desta banca. `
      : "";

    const simulado = await gerarSimuladoComGemini({
      qtdQuestoes,
      contentText,
      cargoInstruction,
      bancaInstruction,
      responseSchema,
    });

    return NextResponse.json(simulado, { status: 200 });
  } catch (error: unknown) {
    console.error("Erro na rota /api/gerar-simulado:", error);

    const mensagem = mensagemErroGemini(error);
    const status =
      error &&
      typeof error === "object" &&
      "message" in error &&
      (error as { message: string }).message === "GEMINI_API_KEY_MISSING"
        ? 500
        : erroRecuperavelStatus(error);

    return NextResponse.json({ error: mensagem }, { status });
  }
}

function erroRecuperavelStatus(error: unknown): number {
  if (!error || typeof error !== "object") return 500;
  const status = (error as { status?: number }).status;
  if (status === 429 || status === 503) return 503;
  if (status === 401 || status === 403) return 401;
  return 500;
}
