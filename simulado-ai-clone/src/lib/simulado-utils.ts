import type { Questao, RespostasUsuario } from "@/types/simulado";

export function calcularResultado(
  questoes: Questao[],
  respostasUsuario: RespostasUsuario
) {
  const totalQuestoes = questoes.length;
  const acertos = questoes.reduce((acc, questao, index) => {
    return acc + (respostasUsuario[index] === questao.resposta_correta ? 1 : 0);
  }, 0);
  const percentual =
    totalQuestoes > 0 ? Math.round((acertos / totalQuestoes) * 100) : 0;

  return { totalQuestoes, acertos, percentual };
}
