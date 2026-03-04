export type Categoria = "CDB" | "Tesouro" | "Acao" | "FII" | "ETF" | "Cripto" | "Outros";

export interface Investimento {
  id: string;
  categoria: Categoria;
  nome: string;
  valorInvestido: number;
  taxaAnual: number; // em decimal (0.04 = 4%)
  dividendYield?: number; // em decimal (0.06 = 6%)
  dataCriacao: string; // ISO string
}

export interface FinancialState {
  investimentos: Investimento[];
  custoVidaMensal: number;
  moeda: "BRL" | "USD" | "EUR";
}

export function criarInvestimento(
  categoria: Categoria,
  nome: string,
  valorInvestido: number,
  taxaAnual: number,
  dividendYield?: number
): Investimento {
  return {
    id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    categoria,
    nome,
    valorInvestido,
    taxaAnual,
    dividendYield,
    dataCriacao: new Date().toISOString(),
  };
}
