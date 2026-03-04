import { Investimento, Categoria } from "../shared/investimento";

/**
 * Calcula o patrimônio total de todos os investimentos
 */
export function totalPatrimonio(investimentos: Investimento[]): number {
  return investimentos.reduce((sum, inv) => sum + inv.valorInvestido, 0);
}

/**
 * Calcula o patrimônio total por categoria
 */
export function patrimoniosPorCategoria(
  investimentos: Investimento[]
): Record<Categoria, number> {
  const categorias: Categoria[] = [
    "CDB",
    "Tesouro",
    "Acao",
    "FII",
    "ETF",
    "Cripto",
    "Outros",
  ];

  const resultado: Record<Categoria, number> = {} as Record<Categoria, number>;

  categorias.forEach((cat) => {
    resultado[cat] = investimentos
      .filter((inv) => inv.categoria === cat)
      .reduce((sum, inv) => sum + inv.valorInvestido, 0);
  });

  return resultado;
}

/**
 * Calcula a distribuição percentual por categoria
 */
export function distribuicaoPorCategoria(
  investimentos: Investimento[]
): Record<Categoria, number> {
  const total = totalPatrimonio(investimentos);
  if (total === 0) {
    const categorias: Categoria[] = [
      "CDB",
      "Tesouro",
      "Acao",
      "FII",
      "ETF",
      "Cripto",
      "Outros",
    ];
    const resultado: Record<Categoria, number> = {} as Record<
      Categoria,
      number
    >;
    categorias.forEach((cat) => {
      resultado[cat] = 0;
    });
    return resultado;
  }

  const porCategoria = patrimoniosPorCategoria(investimentos);
  const resultado: Record<Categoria, number> = {} as Record<Categoria, number>;

  Object.entries(porCategoria).forEach(([cat, valor]) => {
    resultado[cat as Categoria] = (valor / total) * 100;
  });

  return resultado;
}
