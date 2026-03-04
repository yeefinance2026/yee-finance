/**
 * EVY CORE v1 - Financial Independence Calculator
 * 
 * Core calculations for financial freedom metrics:
 * - Days of Freedom (Dias de Liberdade)
 * - Current Monthly Income
 * - Necessary Patrimony
 * - Independence Percentage
 * - Months to Independence
 * - Long-term Projections
 */

export interface EvyInput {
  patrimonioAtual: number; // Current patrimony
  aporteMensal: number; // Monthly contribution
  rendaMensalDesejada: number; // Desired monthly income
  taxaAnual?: number; // Annual return rate (default 0.04 = 4%)
  horizontes?: number[]; // Projection horizons in years (default [3, 5, 10])
}

export interface ProjectionData {
  ano: number;
  patrimonio: number;
  rendaMensal: number;
  independencia: number;
}

export interface EvyOutput {
  diasDeLiberdadeHoje: number;
  rendaMensalAtual: number;
  patrimonioNecessario: number;
  percentualIndependencia: number;
  mesesParaIndependencia: number;
  projections: ProjectionData[];
}

/**
 * Safe number converter - returns 0 if value is NaN or invalid
 */
function safeNumber(value: any, defaultValue: number = 0): number {
  const num = Number(value);
  return isNaN(num) || !isFinite(num) ? defaultValue : num;
}

/**
 * Calculate current monthly income from patrimony
 * Formula: patrimony * (annual_rate / 12)
 */
function calcularRendaMensalAtual(
  patrimonioAtual: number,
  taxaAnual: number
): number {
  const patrimonio = safeNumber(patrimonioAtual, 0);
  const taxa = safeNumber(taxaAnual, 0.04);
  const resultado = patrimonio * (taxa / 12);
  return safeNumber(resultado, 0);
}

/**
 * Calculate days of freedom
 * Formula: (patrimony / desired_monthly_income) * 30
 */
function calcularDiasDeLiberdade(
  patrimonioAtual: number,
  rendaMensalDesejada: number
): number {
  const patrimonio = safeNumber(patrimonioAtual, 0);
  const renda = safeNumber(rendaMensalDesejada, 1);
  
  if (renda <= 0) return 0;
  const resultado = (patrimonio / renda) * 30;
  return Math.round(safeNumber(resultado, 0));
}

/**
 * Calculate necessary patrimony to achieve desired income
 * Formula: desired_monthly_income / (annual_rate / 12)
 */
export function calcularPatrimonioNecessario(
  rendaMensalDesejada: number,
  taxaAnual: number
): number {
  const renda = safeNumber(rendaMensalDesejada, 1);
  const taxa = safeNumber(taxaAnual, 0.04);
  
  if (taxa <= 0) return 0;
  const resultado = renda / (taxa / 12);
  return safeNumber(resultado, 0);
}

/**
 * Calculate independence percentage
 * Formula: (current_monthly_income / desired_monthly_income) * 100
 */
function calcularPercentualIndependencia(
  rendaMensalAtual: number,
  rendaMensalDesejada: number
): number {
  const rendaAtual = safeNumber(rendaMensalAtual, 0);
  const rendaDesejada = safeNumber(rendaMensalDesejada, 1);
  
  if (rendaDesejada <= 0) return 0;
  const resultado = Math.min(100, (rendaAtual / rendaDesejada) * 100);
  return safeNumber(resultado, 0);
}

/**
 * Calculate months to reach financial independence
 * Using compound interest formula: FV = PV * (1 + r)^n + PMT * [((1 + r)^n - 1) / r]
 * Solving for n when FV = patrimonioNecessario
 */
export function calcularMesesParaIndependencia(
  patrimonioAtual: number,
  aporteMensal: number,
  taxaAnual: number,
  patrimonioNecessario: number
): number {
  const patrimonio = safeNumber(patrimonioAtual, 0);
  const aporte = safeNumber(aporteMensal, 0);
  let taxa = safeNumber(taxaAnual, 0.04);
  // Ensure taxa is in decimal format (e.g., 0.08 for 8%, not 8)
  if (taxa > 1) {
    taxa = taxa / 100; // Convert from percentage (8) to decimal (0.08)
  }
  const necessario = safeNumber(patrimonioNecessario, 1);

  if (patrimonio >= necessario) return 0;
  if (aporte <= 0) return 999999; // Return a very large number instead of Infinity

  const taxaMensal = taxa / 12;
  
  if (taxaMensal <= 0) {
    // Without interest, simple linear calculation
    const resultado = Math.ceil((necessario - patrimonio) / aporte);
    return safeNumber(resultado, 999999);
  }

  // Using iterative approach for compound interest calculation
  let meses = 0;
  let patrimonioAtualizado = patrimonio;
  const maxMeses = 1200; // 100 years max

  while (patrimonioAtualizado < necessario && meses < maxMeses) {
    patrimonioAtualizado = patrimonioAtualizado * (1 + taxaMensal) + aporte;
    meses++;
  }

  return meses >= maxMeses ? 999999 : meses;
}

/**
 * Generate projections for specified horizons
 */
function gerarProjections(
  patrimonioAtual: number,
  aporteMensal: number,
  taxaAnual: number,
  rendaMensalDesejada: number,
  horizontes: number[]
): ProjectionData[] {
  const patrimonio = safeNumber(patrimonioAtual, 0);
  const aporte = safeNumber(aporteMensal, 0);
  const taxa = safeNumber(taxaAnual, 0.04);
  const renda = safeNumber(rendaMensalDesejada, 1);
  
  const taxaMensal = taxa / 12;
  const patrimonioNecessario = calcularPatrimonioNecessario(renda, taxa);

  return horizontes.map((anos) => {
    const meses = anos * 12;
    let patrimonioProjetado = patrimonio;

    // Compound interest with monthly contributions
    for (let i = 0; i < meses; i++) {
      patrimonioProjetado = patrimonioProjetado * (1 + taxaMensal) + aporte;
    }

    const rendaMensal = calcularRendaMensalAtual(patrimonioProjetado, taxa);
    const independencia = Math.min(
      100,
      (rendaMensal / renda) * 100
    );

    return {
      ano: anos,
      patrimonio: Math.round(safeNumber(patrimonioProjetado, 0)),
      rendaMensal: Math.round(safeNumber(rendaMensal, 0)),
      independencia: Math.round(safeNumber(independencia * 100, 0)) / 100,
    };
  });
}

/**
 * Main EVY CORE calculation function
 */
export function calcularEvyCore(input: EvyInput): EvyOutput {
  const taxaAnual = safeNumber(input.taxaAnual, 0.04);
  const horizontes = input.horizontes ?? [3, 5, 10];

  const rendaMensalAtual = calcularRendaMensalAtual(
    safeNumber(input.patrimonioAtual, 0),
    taxaAnual
  );

  const patrimonioNecessario = calcularPatrimonioNecessario(
    safeNumber(input.rendaMensalDesejada, 1),
    taxaAnual
  );

  const diasDeLiberdadeHoje = calcularDiasDeLiberdade(
    safeNumber(input.patrimonioAtual, 0),
    safeNumber(input.rendaMensalDesejada, 1)
  );

  const percentualIndependencia = calcularPercentualIndependencia(
    rendaMensalAtual,
    safeNumber(input.rendaMensalDesejada, 1)
  );

  const mesesParaIndependencia = calcularMesesParaIndependencia(
    safeNumber(input.patrimonioAtual, 0),
    safeNumber(input.aporteMensal, 0),
    taxaAnual,
    patrimonioNecessario
  );

  const projections = gerarProjections(
    safeNumber(input.patrimonioAtual, 0),
    safeNumber(input.aporteMensal, 0),
    taxaAnual,
    safeNumber(input.rendaMensalDesejada, 1),
    horizontes
  );

  return {
    diasDeLiberdadeHoje: safeNumber(diasDeLiberdadeHoje, 0),
    rendaMensalAtual: Math.round(safeNumber(rendaMensalAtual, 0)),
    patrimonioNecessario: Math.round(safeNumber(patrimonioNecessario, 0)),
    percentualIndependencia: Math.round(safeNumber(percentualIndependencia * 100, 0)) / 100,
    mesesParaIndependencia: safeNumber(mesesParaIndependencia, 0),
    projections,
  };
}

/**
 * Format currency for display
 */
export function formatarMoeda(valor: number, locale: string = "pt-BR"): string {
  const num = safeNumber(valor, 0);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Format percentage for display
 */
export function formatarPercentual(valor: number): string {
  const num = safeNumber(valor, 0);
  return `${Math.round(num * 100) / 100}%`;
}

/**
 * Format months to years and months
 */
export function formatarMeses(meses: number): string {
  const num = safeNumber(meses, 0);
  
  if (num >= 999999) return "Indefinido";
  if (num <= 0) return "Já alcançado!";

  const anos = Math.floor(num / 12);
  const mesesRestantes = num % 12;

  if (anos === 0) {
    return `${mesesRestantes} mês${mesesRestantes !== 1 ? "es" : ""}`;
  }

  if (mesesRestantes === 0) {
    return `${anos} ano${anos !== 1 ? "s" : ""}`;
  }

  return `${anos} ano${anos !== 1 ? "s" : ""} e ${mesesRestantes} mês${mesesRestantes !== 1 ? "es" : ""}`;
}
