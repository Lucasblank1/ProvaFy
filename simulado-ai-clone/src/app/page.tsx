"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import SetupSimulado from "@/components/SetupSimulado";
import ExecucaoSimulado from "@/components/ExecucaoSimulado";
import ResultadoSimulado, { type SaveStatus } from "@/components/ResultadoSimulado";
import type { Questao, SimuladoMetadata, RespostasUsuario } from "@/types/simulado";

export default function Home() {
  const { data: session } = useSession();
  const [simulado, setSimulado] = useState<Questao[] | null>(null);
  const [respostasUsuario, setRespostasUsuario] =
    useState<RespostasUsuario | null>(null);
  const [meta, setMeta] = useState<SimuladoMetadata>({});
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [historicoId, setHistoricoId] = useState<string | null>(null);

  const handleSimuladoGerado = (
    questoes: Questao[],
    simuladoMeta?: SimuladoMetadata
  ) => {
    setSimulado(questoes);
    setRespostasUsuario(null);
    setMeta(simuladoMeta ?? {});
    setSaveStatus("idle");
    setHistoricoId(null);
  };

  const handleFinalizarSimulado = async (respostas: RespostasUsuario) => {
    setRespostasUsuario(respostas);

    if (!session?.user || !simulado) {
      setSaveStatus("guest");
      return;
    }

    setSaveStatus("saving");

    try {
      const res = await fetch("/api/simulados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questoes: simulado,
          respostas,
          cargo: meta.cargo,
          banca: meta.banca,
        }),
      });

      if (!res.ok) {
        setSaveStatus("error");
        return;
      }

      const data = await res.json();
      setHistoricoId(data.id ?? null);
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  };

  const handleReset = () => {
    setSimulado(null);
    setRespostasUsuario(null);
    setMeta({});
    setSaveStatus("idle");
    setHistoricoId(null);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-[60vh] space-y-8 animate-in fade-in duration-500">
      {!simulado ? (
        <>
          <div className="space-y-4 max-w-2xl text-center mt-10">
            <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Transforme seus PDFs em Simulados
            </h2>
            <p className="text-lg text-gray-600">
              Faça o upload do seu material de estudo ou cole seu texto, e nossa
              inteligência artificial irá gerar questões práticas com gabarito na
              hora.
            </p>
            {!session?.user && (
              <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 inline-block">
                Entre na sua conta para salvar o histórico e revisar erros depois.
              </p>
            )}
          </div>

          <div className="w-full">
            <SetupSimulado onSimuladoGerado={handleSimuladoGerado} />
          </div>
        </>
      ) : !respostasUsuario ? (
        <div className="w-full max-w-3xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">
              Resolvendo Simulado
            </h2>
            <button
              onClick={() => setSimulado(null)}
              className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
            >
              Cancelar Simulado
            </button>
          </div>

          <ExecucaoSimulado
            questoes={simulado}
            onFinalizar={handleFinalizarSimulado}
          />
        </div>
      ) : (
        <div className="w-full">
          <ResultadoSimulado
            questoes={simulado}
            respostasUsuario={respostasUsuario}
            onReset={handleReset}
            saveStatus={saveStatus}
            historicoId={historicoId}
          />
        </div>
      )}
    </div>
  );
}
