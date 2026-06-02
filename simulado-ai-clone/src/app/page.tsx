"use client";

import { useState } from "react";
import SetupSimulado, { Questao } from "@/components/SetupSimulado";
import ExecucaoSimulado from "@/components/ExecucaoSimulado";
import ResultadoSimulado from "@/components/ResultadoSimulado";

export default function Home() {
  const [simulado, setSimulado] = useState<Questao[] | null>(null);
  const [respostasUsuario, setRespostasUsuario] = useState<Record<number, string> | null>(null);

  const handleSimuladoGerado = (questoes: Questao[]) => {
    setSimulado(questoes);
    setRespostasUsuario(null); // Resetar as respostas ao gerar um novo simulado
  };

  const handleFinalizarSimulado = (respostas: Record<number, string>) => {
    setRespostasUsuario(respostas);
  };

  const handleReset = () => {
    setSimulado(null);
    setRespostasUsuario(null);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-[60vh] space-y-8 animate-in fade-in duration-500">
      
      {!simulado ? (
        // MODO 1: SETUP DO SIMULADO (Ainda não temos questões)
        <>
          <div className="space-y-4 max-w-2xl text-center mt-10">
            <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Transforme seus PDFs em Simulados
            </h2>
            <p className="text-lg text-gray-600">
              Faça o upload do seu material de estudo ou cole seu texto, e nossa inteligência artificial irá gerar questões práticas com gabarito na hora.
            </p>
          </div>

          <div className="w-full">
            <SetupSimulado onSimuladoGerado={handleSimuladoGerado} />
          </div>
        </>
      ) : !respostasUsuario ? (
        // MODO 2: EXECUÇÃO DO SIMULADO (Temos questões, mas ainda não finalizou)
        <div className="w-full max-w-3xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">Resolvendo Simulado</h2>
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
        // MODO 3: RESULTADO DO SIMULADO (Finalizou, temos as respostas do usuário)
        <div className="w-full">
          <ResultadoSimulado 
            questoes={simulado} 
            respostasUsuario={respostasUsuario} 
            onReset={handleReset} 
          />
        </div>
      )}

    </div>
  );
}
