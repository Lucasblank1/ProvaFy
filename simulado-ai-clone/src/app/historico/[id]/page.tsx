import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import ResultadoSimulado from "@/components/ResultadoSimulado";
import type { Questao, RespostasUsuario } from "@/types/simulado";

export default async function HistoricoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/historico");
  }

  const { id } = await params;

  const simulado = await prisma.simulado.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!simulado) {
    notFound();
  }

  const questoes = JSON.parse(simulado.questoes) as Questao[];
  const respostasUsuario = JSON.parse(simulado.respostas) as RespostasUsuario;

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <Link
            href="/historico"
            className="text-sm text-blue-600 hover:underline mb-1 inline-block"
          >
            ← Voltar ao histórico
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {simulado.titulo || "Simulado"}
          </h1>
          <p className="text-sm text-gray-500">
            {new Date(simulado.finalizadoEm).toLocaleString("pt-BR")}
          </p>
        </div>
      </div>

      <ResultadoSimulado
        questoes={questoes}
        respostasUsuario={respostasUsuario}
        modoHistorico
      />
    </div>
  );
}
