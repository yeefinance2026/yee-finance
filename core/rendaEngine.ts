import { Investimento } from "../shared/investimento";

/**
 * Calcula a renda passiva mensal total (juros + dividendos)
 */
export function rendaPassivaMensal(investimentos: Investimento[]): number {
  return investimentos.reduce((sum, inv) => {
    const juros = (inv.valorInvestido * inv.taxaAnual) / 12;
    const dividendos = inv.dividendYield
      ? (inv.valorInvestido * inv.dividendYield) / 12
      : 0;
    return sum + juros + dividendos;
  }, 0);
}

/**
 * Calcula a renda passiva anual total (juros + dividendos)
 */
export function rendaPassivaAnual(investimentos: Investimento[]): number {
  return investimentos.reduce((sum, inv) => {
    const juros = inv.valorInvestido * inv.taxaAnual;
    const dividendos = inv.dividendYield
      ? inv.valorInvestido * inv.dividendYield
      : 0;
    return sum + juros + dividendos;
  }, 0);
}

/**
 * Calcula a renda mensal por investimento
 */
export function rendaMensalPorInvestimento(investimento: Investimento): {
  juros: number;
  dividendos: number;
  total: number;
} {
  const juros = (investimento.valorInvestido * investimento.taxaAnual) / 12;
  const dividendos = investimento.dividendYield
    ? (investimento.valorInvestido * investimento.dividendYield) / 12
    : 0;

  return {
    juros,
    dividendos,
    total: juros + dividendos,
  };
}

/**
 * Calcula a renda anual por investimento
 */
export function rendaAnualPorInvestimento(investimento: Investimento): {
  juros: number;
  dividendos: number;
  total: number;
} {
  const juros = investimento.valorInvestido * investimento.taxaAnual;
  const dividendos = investimento.dividendYield
    ? investimento.valorInvestido * investimento.dividendYield
    : 0;

  return {
    juros,
    dividendos,
    total: juros + dividendos,
  };
}
