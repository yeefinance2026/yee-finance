/**
 * Calcula os dias de liberdade
 * dias = (renda_passiva_mensal / custo_vida_mensal) * 30
 */
export function diasDeLiberdade(
  rendaMensalPassiva: number,
  custoVidaMensal: number
): number {
  if (custoVidaMensal <= 0) return 0;
  return (rendaMensalPassiva / custoVidaMensal) * 30;
}

/**
 * Calcula o percentual de independência
 * percentual = (renda_passiva_mensal / custo_vida_mensal) * 100
 */
export function percentualIndependencia(
  rendaMensalPassiva: number,
  custoVidaMensal: number
): number {
  if (custoVidaMensal <= 0) return 0;
  return (rendaMensalPassiva / custoVidaMensal) * 100;
}

/**
 * Calcula se o usuário é financeiramente independente
 */
export function ehIndependente(
  rendaMensalPassiva: number,
  custoVidaMensal: number
): boolean {
  return rendaMensalPassiva >= custoVidaMensal;
}

/**
 * Calcula quanto falta de renda mensal para ser independente
 */
export function rendaFaltante(
  rendaMensalPassiva: number,
  custoVidaMensal: number
): number {
  const faltante = custoVidaMensal - rendaMensalPassiva;
  return faltante > 0 ? faltante : 0;
}

/**
 * Calcula quanto patrimônio é necessário para ser independente
 * patrimonio_necessario = custo_vida_mensal * 12 / taxa_anual
 */
export function patrimonioNecessario(
  custoVidaMensal: number,
  taxaAnualMedia: number
): number {
  if (taxaAnualMedia <= 0) return Infinity;
  return (custoVidaMensal * 12) / taxaAnualMedia;
}
