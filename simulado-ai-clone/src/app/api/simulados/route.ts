import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { calcularResultado } from "@/lib/simulado-utils";
import type { Questao, RespostasUsuario } from "@/types/simulado";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const simulados = await prisma.simulado.findMany({
    where: { userId: session.user.id },
    orderBy: { finalizadoEm: "desc" },
    select: {
      id: true,
      titulo: true,
      cargo: true,
      banca: true,
      totalQuestoes: true,
      acertos: true,
      percentual: true,
      finalizadoEm: true,
    },
  });

  return NextResponse.json(simulados);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const questoes = body.questoes as Questao[] | undefined;
    const respostas = body.respostas as RespostasUsuario | undefined;

    if (!Array.isArray(questoes) || questoes.length === 0) {
      return NextResponse.json(
        { error: "Questões inválidas." },
        { status: 400 }
      );
    }

    if (!respostas || typeof respostas !== "object") {
      return NextResponse.json(
        { error: "Respostas inválidas." },
        { status: 400 }
      );
    }

    const { totalQuestoes, acertos, percentual } = calcularResultado(
      questoes,
      respostas
    );

    const titulo =
      typeof body.titulo === "string" && body.titulo.trim()
        ? body.titulo.trim()
        : `Simulado ${new Date().toLocaleDateString("pt-BR")}`;

    const cargo =
      typeof body.cargo === "string" && body.cargo.trim()
        ? body.cargo.trim()
        : null;
    const banca =
      typeof body.banca === "string" && body.banca.trim()
        ? body.banca.trim()
        : null;

    const simulado = await prisma.simulado.create({
      data: {
        userId: session.user.id,
        titulo,
        cargo,
        banca,
        totalQuestoes,
        acertos,
        percentual,
        questoes: JSON.stringify(questoes),
        respostas: JSON.stringify(respostas),
      },
      select: { id: true },
    });

    return NextResponse.json({ id: simulado.id }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível salvar o simulado." },
      { status: 500 }
    );
  }
}
