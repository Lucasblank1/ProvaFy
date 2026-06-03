export interface Questao {
  id: number;
  enunciado: string;
  alternativas: {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
  };
  resposta_correta: string;
  explicacao: string;
}

export type RespostasUsuario = Record<number, string>;

export interface SimuladoMetadata {
  cargo?: string;
  banca?: string;
}
