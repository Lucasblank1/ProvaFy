import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type, Schema } from "@google/genai";

// Inicializando o SDK do Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    let contentText = formData.get("text") as string | null;
    const file = formData.get("file") as File | null;
    const qtdQuestoesRaw = formData.get("qtdQuestoes") as string | null;
    const cargo = formData.get("cargo") as string | null;
    const banca = formData.get("banca") as string | null;
    
    const qtdQuestoes = qtdQuestoesRaw ? parseInt(qtdQuestoesRaw, 10) : 5;

    // Se houver um arquivo PDF, vamos extrair o texto dele
    if (file && file.name.endsWith(".pdf")) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Importamos usando require dinamicamente para evitar problemas de Canvas e DOM do pdf.js no Next.js Server
      const pdfParse = require("pdf-parse");
      
      const pdfData = await pdfParse(buffer);
      contentText = pdfData.text;
    }

    // Validação de entrada
    if (!contentText || contentText.trim() === "") {
      return NextResponse.json(
        { error: "Nenhum conteúdo válido (texto ou arquivo PDF) foi fornecido." },
        { status: 400 }
      );
    }

    // Definindo um Schema rigoroso para garantir a estrutura do JSON
    const responseSchema: Schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { 
            type: Type.INTEGER 
          },
          enunciado: { 
            type: Type.STRING 
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
            description: "Apenas a letra correspondente à resposta correta. Exemplo: 'A', 'B', 'C', 'D' ou 'E'" 
          },
          explicacao: { 
            type: Type.STRING 
          },
        },
        required: ["id", "enunciado", "alternativas", "resposta_correta", "explicacao"],
      }
    };

    // Personalizando o System Instruction de acordo com os inputs opcionais
    let cargoInstruction = cargo ? `O público-alvo deste simulado são candidatos ao cargo de "${cargo}". Adapte o nível de dificuldade, a linguagem e a abordagem das questões para o padrão esperado para este cargo. ` : "";
    let bancaInstruction = banca ? `A banca organizadora do concurso é a "${banca}". Baseie-se fortemente no estilo, nas "pegadinhas" tradicionais e na forma de cobrar (textos longos, jurisprudência, literalidade da lei, modelo de múltipla escolha) características exclusivas desta banca. ` : "";

    // Chamada à API do Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Gere ${qtdQuestoes} questões de múltipla escolha com base exclusivamente neste texto:\n\n${contentText}`,
      config: {
        systemInstruction: `Você é um experiente professor e elaborador de questões de concursos públicos. Sua tarefa é criar um simulado. ${cargoInstruction}${bancaInstruction}Gere o simulado APENAS com temas contidos no texto fornecido, sem inventar fatos ou regras externas que fujam ao material. Extraia interpretação, conceitos e detalhes dados pelo próprio texto, abordando-os com a complexidade solicitada.`,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2, // Temperatura baixa para respostas mais exatas e baseadas no texto
      }
    });

    if (response.text) {
      const simulado = JSON.parse(response.text);
      return NextResponse.json(simulado, { status: 200 });
    } else {
      throw new Error("A API não retornou nenhum conteúdo válido.");
    }
    
  } catch (error: any) {
    console.error("Erro na rota /api/gerar-simulado:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro ao processar o arquivo/texto e gerar o simulado.", details: error.message },
      { status: 500 }
    );
  }
}
