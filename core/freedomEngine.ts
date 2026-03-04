/**
 * 🛡️ FREEDOM ENGINE v1
 * 
 * Núcleo independente de cálculos de liberdade financeira.
 * Zero dependências. Reutilizável em web, mobile, CLI, etc.
 * 
 * Protagonista: DIAS
 * Métrica: Quanto tempo seu patrimônio sustenta sua vida?
 */

export interface FreedomInput {
  patrimonio: number;           // Seu patrimônio atual
  aporteMensal: number;         // Quanto você investe por mês
  despesaMensal: number;        // Quanto você gasta por mês (sua "renda desejada")
  taxaAnualRetorno?: number;    // Retorno anual esperado (default: 0.04 = 4%)
  horizontes?: number[];        // Anos para projetar (default: [1, 3, 5, 10])
}

export interface FreedomMetrics {
  diasDeLiberdadeHoje: number;
  anosDeLiberdadeHoje: number;
  
  rendaMensalAtual: number;
  percentualCoberturaAtual: number;
  
  patrimonioNecessario: number;
  percentualProgresso: number;
  
  mesesParaLiberdade: number;
  anosParaLiberdade: number;
  
  projections: ProjectionYear[];
}

export interface ProjectionYear {
  ano: number;
  patrimonio: number;
  rendaMensal: number;
  diasDeLiberdade: number;
  cobertura: number; // % da despesa coberta
}

/**
 * Calcula dias de liberdade
 * Fórmula: (patrimônio / despesa_mensal) * 30
 */
function calcularDiasDeLiberdade(patrimonio: number, despesaMensal: number): number {
  if (despesaMensal <= 0) return 0;
  return Math.round((patrimonio / despesaMensal) * 30);
}

/**
 * Calcula anos de liberdade
 * Fórmula: dias / 365
 */
function calcularAnosDeLiberdade(diasDeLiberdade: number): number {
  return Math.round((diasDeLiberdade / 365) * 100) / 100;
}

/**
 * Calcula renda mensal gerada pelo patrimônio
 * Fórmula: patrimônio * (taxa_anual / 12)
 */
function calcularRendaMensal(patrimonio: number, taxaAnual: number): number {
  return patrimonio * (taxaAnual / 12);
}

/**
 * Calcula patrimônio necessário para cobrir despesa
 * Fórmula: despesa_mensal / (taxa_anual / 12)
 */
function calcularPatrimonioNecessario(despesaMensal: number, taxaAnual: number): number {
  if (taxaAnual <= 0) return Infinity;
  return despesaMensal / (taxaAnual / 12);
}

/**
 * Calcula meses até atingir liberdade financeira
 * Usa juros compostos com aportes mensais
 */
function calcularMesesParaLiberdade(
  patrimonioAtual: number,
  aporteMensal: number,
  patrimonioNecessario: number,
  taxaAnual: number
): number {
  if (patrimonioAtual >= patrimonioNecessario) return 0;
  if (aporteMensal <= 0) return Infinity;

  const taxaMensal = taxaAnual / 12;
  let meses = 0;
  let patrimonio = patrimonioAtual;
  const maxMeses = 1200; // 100 anos

  while (patrimonio < patrimonioNecessario && meses < maxMeses) {
    patrimonio = patrimonio * (1 + taxaMensal) + aporteMensal;
    meses++;
  }

  return meses >= maxMeses ? Infinity : meses;
}

/**
 * Gera projeções para horizontes especificados
 */
function gerarProjections(
  patrimonioAtual: number,
  aporteMensal: number,
  despesaMensal: number,
  taxaAnual: number,
  horizontes: number[]
): ProjectionYear[] {
  const taxaMensal = taxaAnual / 12;

  return horizontes.map((anos) => {
    const meses = anos * 12;
    let patrimonio = patrimonioAtual;

    // Calcula com juros compostos
    for (let i = 0; i < meses; i++) {
      patrimonio = patrimonio * (1 + taxaMensal) + aporteMensal;
    }

    const rendaMensal = calcularRendaMensal(patrimonio, taxaAnual);
    const diasDeLiberdade = calcularDiasDeLiberdade(patrimonio, despesaMensal);
    const cobertura = Math.min(100, (rendaMensal / despesaMensal) * 100);

    return {
      ano: anos,
      patrimonio: Math.round(patrimonio),
      rendaMensal: Math.round(rendaMensal),
      diasDeLiberdade,
      cobertura: Math.round(cobertura * 100) / 100,
    };
  });
}

/**
 * 🎯 FUNÇÃO PRINCIPAL
 * Calcula todas as métricas de liberdade
 */
export function calcularFreedom(input: FreedomInput): FreedomMetrics {
  const taxaAnual = input.taxaAnualRetorno ?? 0.04;
  const horizontes = input.horizontes ?? [1, 3, 5, 10];

  const rendaMensalAtual = calcularRendaMensal(input.patrimonio, taxaAnual);
  const patrimonioNecessario = calcularPatrimonioNecessario(input.despesaMensal, taxaAnual);
  
  const diasDeLiberdadeHoje = calcularDiasDeLiberdade(input.patrimonio, input.despesaMensal);
  const anosDeLiberdadeHoje = calcularAnosDeLiberdade(diasDeLiberdadeHoje);
  
  const percentualCoberturaAtual = Math.min(100, (rendaMensalAtual / input.despesaMensal) * 100);
  const percentualProgresso = Math.min(100, (input.patrimonio / patrimonioNecessario) * 100);
  
  const mesesParaLiberdade = calcularMesesParaLiberdade(
    input.patrimonio,
    input.aporteMensal,
    patrimonioNecessario,
    taxaAnual
  );

  const anosParaLiberdade = Math.floor(mesesParaLiberdade / 12);

  const projections = gerarProjections(
    input.patrimonio,
    input.aporteMensal,
    input.despesaMensal,
    taxaAnual,
    horizontes
  );

  return {
    diasDeLiberdadeHoje,
    anosDeLiberdadeHoje,
    rendaMensalAtual: Math.round(rendaMensalAtual),
    percentualCoberturaAtual: Math.round(percentualCoberturaAtual * 100) / 100,
    patrimonioNecessario: Math.round(patrimonioNecessario),
    percentualProgresso: Math.round(percentualProgresso * 100) / 100,
    mesesParaLiberdade,
    anosParaLiberdade,
    projections,
  };
}

/**
 * Utilitários de formatação (opcionais, para conveniência)
 */

export function formatarDias(dias: number): string {
  if (dias === 0) return "0 dias";
  if (dias === Infinity) return "∞";
  
  const anos = Math.floor(dias / 365);
  const meses = Math.floor((dias % 365) / 30);
  const diasRestantes = dias % 30;

  const partes = [];
  if (anos > 0) partes.push(`${anos}a`);
  if (meses > 0) partes.push(`${meses}m`);
  if (diasRestantes > 0) partes.push(`${diasRestantes}d`);

  return partes.join(" ");
}

export function formatarMeses(meses: number): string {
  if (meses === Infinity) return "∞";
  if (meses <= 0) return "Já!";

  const anos = Math.floor(meses / 12);
  const mesesRestantes = meses % 12;

  if (anos === 0) return `${mesesRestantes}m`;
  if (mesesRestantes === 0) return `${anos}a`;
  return `${anos}a ${mesesRestantes}m`;
}

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor);
}

export function formatarPercentual(valor: number): string {
  return `${Math.round(valor * 100) / 100}%`;
}
