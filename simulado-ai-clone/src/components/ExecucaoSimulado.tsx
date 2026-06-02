"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { Questao } from "./SetupSimulado";

interface ExecucaoSimuladoProps {
  questoes: Questao[];
  onFinalizar: (respostas: Record<number, string>) => void;
}

export default function ExecucaoSimulado({ questoes, onFinalizar }: ExecucaoSimuladoProps) {
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [respostas, setRespostas] = useState<Record<number, string>>({});

  const questaoAtual = questoes[indiceAtual];
  const totalQuestoes = questoes.length;
  const isUltimaQuestao = indiceAtual === totalQuestoes - 1;
  const isPrimeiraQuestao = indiceAtual === 0;

  const handleSelecionarAlternativa = (letra: string) => {
    setRespostas((prev) => ({
      ...prev,
      [indiceAtual]: letra,
    }));
  };

  const proximaQuestao = () => {
    if (!isUltimaQuestao) {
      setIndiceAtual((prev) => prev + 1);
    }
  };

  const questaoAnterior = () => {
    if (!isPrimeiraQuestao) {
      setIndiceAtual((prev) => prev - 1);
    }
  };

  const finalizar = () => {
    onFinalizar(respostas);
  };

  // Convertendo as alternativas do objeto para um array iterável
  const alternativasArray = Object.entries(questaoAtual.alternativas);

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Cabeçalho do Simulado (Progresso) */}
      <div className="bg-gray-50 border-b border-gray-200 p-4 px-6 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Questão {indiceAtual + 1} de {totalQuestoes}
        </span>
        <div className="flex space-x-1">
          {questoes.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 w-8 rounded-full transition-colors ${
                idx === indiceAtual
                  ? "bg-blue-600"
                  : respostas[idx]
                  ? "bg-blue-300"
                  : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-8">
        {/* Enunciado */}
        <div className="space-y-4 text-gray-800">
          <p className="text-lg leading-relaxed whitespace-pre-wrap">
            <span className="font-bold mr-2">{indiceAtual + 1}.</span>
            {questaoAtual.enunciado}
          </p>
        </div>

        {/* Alternativas */}
        <div className="space-y-3">
          {alternativasArray.map(([letra, texto]) => {
            const isSelecionada = respostas[indiceAtual] === letra;
            return (
              <button
                key={letra}
                onClick={() => handleSelecionarAlternativa(letra)}
                className={`w-full flex items-start text-left p-4 rounded-xl border-2 transition-all ${
                  isSelecionada
                    ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600 ring-opacity-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm mr-4 border ${
                    isSelecionada
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-300"
                  }`}
                >
                  {letra}
                </div>
                <div className={`mt-1 text-base ${isSelecionada ? "text-blue-900 font-medium" : "text-gray-700"}`}>
                  {texto}
                </div>
              </button>
            );
          })}
        </div>

        {/* Barra de Navegação */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
          <button
            onClick={questaoAnterior}
            disabled={isPrimeiraQuestao}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Anterior</span>
          </button>

          {!isUltimaQuestao ? (
            <button
              onClick={proximaQuestao}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors"
            >
              <span>Próxima</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={finalizar}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              <span>Finalizar Simulado</span>
              <CheckCircle2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
