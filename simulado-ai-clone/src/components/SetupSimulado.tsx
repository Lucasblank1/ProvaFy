"use client";

import { useState, FormEvent, useRef } from "react";
import { UploadCloud, FileText, Loader2, AlertCircle, File as FileIcon, X } from "lucide-react";
import type { Questao, SimuladoMetadata } from "@/types/simulado";

export type { Questao };

interface SetupSimuladoProps {
  onSimuladoGerado: (simulado: Questao[], meta?: SimuladoMetadata) => void;
}

export default function SetupSimulado({ onSimuladoGerado }: SetupSimuladoProps) {
  const [textoConteudo, setTextoConteudo] = useState("");
  const [arquivoPdf, setArquivoPdf] = useState<File | null>(null);
  const [qtdQuestoes, setQtdQuestoes] = useState<number>(5);
  const [cargo, setCargo] = useState("");
  const [banca, setBanca] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf") {
        setErro("Por favor, selecione apenas arquivos PDF.");
        return;
      }
      setArquivoPdf(file);
      setErro(null);
    }
  };

  const clearFile = () => {
    setArquivoPdf(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (!arquivoPdf && textoConteudo.trim() === "") {
      setErro("Forneça um arquivo PDF ou cole o texto base para o simulado.");
      return;
    }

    if (qtdQuestoes < 1 || qtdQuestoes > 80) {
      setErro("A quantidade de questões deve ser entre 1 e 80.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      if (arquivoPdf) {
        formData.append("file", arquivoPdf);
      }
      if (textoConteudo.trim()) {
        formData.append("text", textoConteudo);
      }
      formData.append("qtdQuestoes", qtdQuestoes.toString());
      if (cargo.trim()) {
        formData.append("cargo", cargo);
      }
      if (banca.trim()) {
        formData.append("banca", banca);
      }

      const response = await fetch("/api/gerar-simulado", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        const mensagem =
          data.error ||
          (response.status === 503
            ? "O serviço de IA está temporariamente sobrecarregado. Tente novamente em instantes."
            : "Ocorreu um erro ao processar o simulado.");
        throw new Error(mensagem);
      }

      onSimuladoGerado(data, {
        cargo: cargo.trim() || undefined,
        banca: banca.trim() || undefined,
      });
    } catch (err: any) {
      setErro(err.message || "Erro de conexão ao comunicar com a API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Configurar Simulado</h2>
        
        <form id="formulario-simulado" onSubmit={handleSubmit} className="space-y-6">
          
          {/* Área de Textarea */}
          <div className="space-y-2">
            <label htmlFor="texto-conteudo" className="block text-sm font-medium text-gray-700">
              Cole o texto da matéria
            </label>
            <textarea
              id="texto-conteudo"
              rows={4}
              value={textoConteudo}
              onChange={(e) => setTextoConteudo(e.target.value)}
              disabled={loading || arquivoPdf !== null}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400 resize-none text-sm text-black placeholder:text-black/60"
              placeholder={arquivoPdf ? "O envio por texto fica desabilitado ao selecionar um PDF." : "Ex: A Constituição Federal de 1988 estabelece que..."}
            />
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 border-t border-gray-200"></div>
            <span className="relative bg-white px-4 text-xs text-gray-500 font-medium uppercase uppercase">Ou utilize um PDF</span>
          </div>

          {/* Área de Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Arquivo da matéria (.pdf)
            </label>
            
            {!arquivoPdf ? (
              <div 
                onClick={() => !loading && fileInputRef.current?.click()}
                className={`relative border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer group flex flex-col items-center justify-center text-center ${loading ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <input
                  id="arquivo-pdf"
                  type="file"
                  accept=".pdf"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={loading}
                />
                <UploadCloud className="w-10 h-10 text-gray-400 group-hover:text-blue-500 mb-3" />
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-blue-600">Clique para buscar</span> ou arraste o arquivo
                </p>
                <p className="text-xs text-gray-500 mt-1">Apenas PDF (máx. 10MB)</p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 border border-blue-200 bg-blue-50 rounded-xl">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <FileIcon className="w-6 h-6" />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-medium text-gray-900 truncate">{arquivoPdf.name}</p>
                    <p className="text-xs text-gray-500">{(arquivoPdf.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={clearFile}
                  disabled={loading}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input Cargo */}
            <div className="space-y-2">
              <label htmlFor="cargo" className="block text-sm font-medium text-gray-700">
                Cargo
              </label>
              <input
                id="cargo"
                type="text"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                disabled={loading}
                placeholder="Ex: Auditor Fiscal"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400 text-sm text-black placeholder:text-black/60"
              />
            </div>

            {/* Input Banca */}
            <div className="space-y-2">
              <label htmlFor="banca" className="block text-sm font-medium text-gray-700">
                Banca
              </label>
              <input
                id="banca"
                type="text"
                value={banca}
                onChange={(e) => setBanca(e.target.value)}
                disabled={loading}
                placeholder="Ex: Cebraspe, FGV"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400 text-sm text-black placeholder:text-black/60"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Input Numérico */}
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <label htmlFor="qtd-questoes" className="block text-sm font-medium text-gray-700">
                Número de questões
              </label>
              <input
                id="qtd-questoes"
                type="number"
                min="1"
                max="80"
                value={qtdQuestoes}
                onChange={(e) => setQtdQuestoes(Number(e.target.value))}
                disabled={loading}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-50 text-sm text-black placeholder:text-black/60"
              />
            </div>
          </div>

          {erro && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          {/* Botão de Submit */}
          <button
            id="btn-gerar"
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl shadow-sm transition-colors flex items-center justify-center space-x-2 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processando com IA...</span>
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                <span>Gerar Simulado</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
