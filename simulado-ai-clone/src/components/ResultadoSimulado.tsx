"use client";

import Link from "next/link";
import { CheckCircle2, XCircle, Lightbulb, RotateCcw, History, AlertCircle } from "lucide-react";
import type { Questao, RespostasUsuario } from "@/types/simulado";
import { calcularResultado } from "@/lib/simulado-utils";

export type SaveStatus = "idle" | "saving" | "saved" | "guest" | "error";

interface ResultadoSimuladoProps {
  questoes: Questao[];
  respostasUsuario: RespostasUsuario;
  onReset?: () => void;
  modoHistorico?: boolean;
  saveStatus?: SaveStatus;
  historicoId?: string | null;
}

export default function ResultadoSimulado({
  questoes,
  respostasUsuario,
  onReset,
  modoHistorico = false,
  saveStatus = "idle",
  historicoId = null,
}: ResultadoSimuladoProps) {
  const { totalQuestoes, acertos, percentual } = calcularResultado(
    questoes,
    respostasUsuario
  );

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {!modoHistorico && saveStatus !== "idle" && (
        <div
          className={`rounded-xl px-4 py-3 text-sm border ${
            saveStatus === "saved"
              ? "bg-green-50 border-green-200 text-green-800"
              : saveStatus === "guest"
                ? "bg-amber-50 border-amber-200 text-amber-900"
                : saveStatus === "error"
                  ? "bg-red-50 border-red-200 text-red-800"
                  : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          {saveStatus === "saving" && "Salvando no seu histórico..."}
          {saveStatus === "saved" && (
            <span className="flex flex-wrap items-center gap-2">
              Simulado salvo no histórico.
              {historicoId && (
                <Link
                  href={`/historico/${historicoId}`}
                  className="font-medium underline inline-flex items-center gap-1"
                >
                  <History className="w-4 h-4" />
                  Ver depois
                </Link>
              )}
            </span>
          )}
          {saveStatus === "guest" && (
            <span className="flex flex-wrap items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <Link href="/login" className="font-medium underline">
                Faça login
              </Link>{" "}
              para guardar este resultado e revisar erros depois.
            </span>
          )}
          {saveStatus === "error" && "Não foi possível salvar. Tente novamente mais tarde."}
        </div>
      )}

      {/* Cabeçalho de Pontuação */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden text-center p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Resultado Final</h2>
        <div className="text-lg text-gray-600 mb-4">
          Você acertou <span className="font-semibold text-gray-900">{acertos}</span> de {totalQuestoes} questões
        </div>
        
        <div className="flex justify-center items-center">
          <div className={`text-5xl font-extrabold ${percentual >= 70 ? 'text-green-600' : percentual >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
            {percentual}%
          </div>
        </div>
      </div>

      {/* Lista de Revisão */}
      <div className="space-y-6">
        {questoes.map((questao, index) => {
          const respostaDada = respostasUsuario[index];
          const acertouEsta = respostaDada === questao.resposta_correta;
          const alternativasArray = Object.entries(questao.alternativas);

          return (
            <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 sm:p-8 space-y-6">
                
                {/* Cabeçalho e Enunciado */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                      Questão {index + 1}
                    </span>
                    {acertouEsta ? (
                      <span className="flex items-center text-green-600 text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Correto
                      </span>
                    ) : (
                      <span className="flex items-center text-red-600 text-sm font-medium">
                        <XCircle className="w-4 h-4 mr-1" /> Incorreto
                      </span>
                    )}
                  </div>
                  <p className="text-lg text-gray-800 leading-relaxed whitespace-pre-wrap font-medium">
                    {questao.enunciado}
                  </p>
                </div>

                {/* Alternativas */}
                <div className="space-y-3">
                  {alternativasArray.map(([letra, texto]) => {
                    const isCorreta = letra === questao.resposta_correta;
                    const isDadaEIncorreta = letra === respostaDada && !isCorreta;
                    
                    let bgClass = "border-gray-200 bg-white text-gray-700"; // Neutro
                    let icon = null;

                    if (isCorreta) {
                      bgClass = "border-green-500 bg-green-50 text-green-900 ring-1 ring-green-500 ring-opacity-50";
                      icon = <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />;
                    } else if (isDadaEIncorreta) {
                      bgClass = "border-red-300 bg-red-50 text-red-900 border-2"; // Destaca a errada
                      icon = <XCircle className="w-5 h-5 text-red-500 shrink-0" />;
                    }

                    return (
                      <div
                        key={letra}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${bgClass}`}
                      >
                        <div className="flex items-start">
                          <div
                            className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm mr-4 border ${
                              isCorreta ? "bg-green-600 text-white border-green-600"
                              : isDadaEIncorreta ? "bg-red-500 text-white border-red-500"
                              : "bg-white text-gray-600 border-gray-300"
                            }`}
                          >
                            {letra}
                          </div>
                          <div className="mt-1 text-base">{texto}</div>
                        </div>
                        {icon && <div className="ml-4">{icon}</div>}
                      </div>
                    );
                  })}
                </div>

                {/* Explicação da IA */}
                <div className="mt-6 bg-blue-50/70 border border-blue-100 rounded-xl p-5 flex items-start space-x-4">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-full shrink-0">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-blue-900 mb-1 tracking-wide uppercase">
                      Explicação do Professor
                    </h4>
                    <p className="text-blue-800 text-sm leading-relaxed">
                      {questao.explicacao}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Ações */}
      <div className="pt-4 pb-12 flex flex-wrap justify-center gap-4">
        {modoHistorico ? (
          <Link
            href="/historico"
            className="flex items-center space-x-2 px-8 py-4 rounded-xl font-semibold bg-gray-900 text-white hover:bg-gray-800 shadow-sm transition-all"
          >
            <History className="w-5 h-5" />
            <span>Voltar ao histórico</span>
          </Link>
        ) : (
          onReset && (
            <button
              onClick={onReset}
              className="flex items-center space-x-2 px-8 py-4 rounded-xl font-semibold bg-gray-900 text-white hover:bg-gray-800 shadow-sm transition-all hover:shadow hover:-translate-y-0.5"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Criar Novo Simulado</span>
            </button>
          )
        )}
      </div>

    </div>
  );
}
