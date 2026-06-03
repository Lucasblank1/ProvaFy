import Link from "next/link";

export default function HistoricoNotFound() {
  return (
    <div className="text-center py-16 space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Simulado não encontrado</h1>
      <Link href="/historico" className="text-blue-600 hover:underline">
        Voltar ao histórico
      </Link>
    </div>
  );
}
