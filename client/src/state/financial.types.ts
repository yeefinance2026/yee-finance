
export type TipoRendimento = "juros" | "dividendo";

export interface Investimento {
  id: string;
  nome: string;
  valor: number;
  categoria: string;
  taxaAnual: number;
  tipoRendimento: TipoRendimento; // "juros" para CDB/Tesouro, "dividendo" para Ação/FII
  dataAporte: string
}

export interface LancamentoDividendo {
  id: string;
  investimentoId: string;
  investimentoNome: string;
  valor: number;
  mes: string; // formato "YYYY-MM"
  data: string; // ISO date string
}

export interface FinancialState {
  investimentos: Investimento[];
  dividendos: LancamentoDividendo[];
  numeroLiberdade: number;
  patrimonioAtual: number;
  aporteMensal: number;
  taxaAnual: number;
  moeda: "BRL" | "USD" | "EUR";
}
