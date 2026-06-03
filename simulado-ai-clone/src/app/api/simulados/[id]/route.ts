import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { id } = await params;

  const simulado = await prisma.simulado.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!simulado) {
    return NextResponse.json(
      { error: "Simulado não encontrado." },
      { status: 404 }
    );
  }

  return NextResponse.json(simulado);
}
