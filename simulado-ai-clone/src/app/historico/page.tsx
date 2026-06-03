import Link from "next/link";
import { auth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ChevronRight, ClipboardList } from "lucide-react";

export default async function HistoricoPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/historico");
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

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Meu histórico</h1>
        <p className="text-gray-600">
          Revise simulados anteriores e veja onde errou.
        </p>
      </div>

      {simulados.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-4">
          <ClipboardList className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="text-gray-600">
            Você ainda não salvou nenhum simulado. Faça um simulado logado para
            guardar o resultado aqui.
          </p>
          <Link
            href="/"
            className="inline-block text-blue-600 font-medium hover:underline"
          >
            Criar simulado
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {simulados.map((s) => {
            const data = new Date(s.finalizadoEm).toLocaleString("pt-BR", {
              dateStyle: "short",
              timeStyle: "short",
            });
            const corPercentual =
              s.percentual >= 70
                ? "text-green-600"
                : s.percentual >= 50
                  ? "text-yellow-600"
                  : "text-red-600";

            return (
              <li key={s.id}>
                <Link
                  href={`/historico/${s.id}`}
                  className="flex items-center justify-between gap-4 bg-white rounded-2xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all group"
                >
                  <div className="space-y-1 min-w-0">
                    <h2 className="font-semibold text-gray-900 truncate">
                      {s.titulo || "Simulado"}
                    </h2>
                    <p className="text-sm text-gray-500">{data}</p>
                    {(s.cargo || s.banca) && (
                      <p className="text-xs text-gray-400 truncate">
                        {[s.cargo, s.banca].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      {s.acertos}/{s.totalQuestoes} acertos
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-2xl font-bold ${corPercentual}`}>
                      {s.percentual}%
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
