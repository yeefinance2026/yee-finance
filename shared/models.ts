/**
 * 📊 MODELO DE DADOS EVY CORE v1
 * 
 * Estrutura definitiva para uso como produto real
 * Sem mudanças futuras = confiável
 */

/**
 * Configurações do usuário
 * Dados que definem o "ritmo" de liberdade
 */
export interface EvyConfig {
  // Custo de vida mensal (despesa)
  custoDeMessal: number;

  // Taxa anual de retorno esperado (ex: 0.04 = 4%)
  taxaAnualRetorno: number;

  // Aporte mensal padrão (sugestão)
  aporteMensalPadrao: number;

  // Data da última atualização
  ultimaAtualizacao: string; // ISO 8601
}

/**
 * Patrimônio atual
 * Valor total investido/poupado
 */
export interface EvyPatrimonio {
  // Valor total em R$
  valorTotal: number;

  // Data da última atualização
  ultimaAtualizacao: string; // ISO 8601

  // Histórico de mudanças (para auditoria)
  historico: {
    data: string;
    valorAnterior: number;
    valorNovo: number;
    motivo: string; // "aporte", "dividendo", "ajuste manual"
  }[];
}

/**
 * Aporte ou dividendo
 * Registro de entrada de dinheiro
 */
export interface EvyAporte {
  // ID único
  id: string;

  // Valor em R$
  valor: number;

  // Data do aporte
  data: string; // ISO 8601

  // Tipo: "aporte" (investimento) ou "dividendo" (rendimento)
  tipo: "aporte" | "dividendo";

  // Descrição opcional
  descricao?: string;
}

/**
 * Estado completo do usuário
 * Tudo que precisa ser persistido
 */
export interface EvyAppState {
  // Configurações
  config: EvyConfig;

  // Patrimônio atual
  patrimonio: EvyPatrimonio;

  // Lista de aportes/dividendos
  aportes: EvyAporte[];

  // Versão do modelo (para migrations futuras)
  versao: "1.0.0";

  // Data de criação da conta
  dataCriacao: string; // ISO 8601
}

/**
 * Resultado do cálculo (cache)
 * Calculado a partir de Config + Patrimônio
 */
export interface EvyMetricasCache {
  // Dias de liberdade hoje
  diasDeLiberdadeHoje: number;

  // Renda mensal gerada pelo patrimônio
  rendaMensalAtual: number;

  // % de independência (renda / custo)
  percentualIndependencia: number;

  // Patrimônio necessário para ser independente
  patrimonioNecessario: number;

  // % do caminho para independência
  percentualProgresso: number;

  // Meses até independência (com aportes)
  mesesParaIndependencia: number;

  // Data do cálculo
  dataCalculo: string; // ISO 8601
}

/**
 * Estado do Simulador
 * Separado do estado real para não alterar dados
 */
export interface EvySimuladorState {
  // Cópia dos dados reais para simular
  patrimonio: number;
  custoDeMessal: number;
  aporteMensal: number;
  taxaAnualRetorno: number;

  // Resultado da simulação
  metricas: any; // FreedomMetrics
}

/**
 * Histórico agregado
 * Para dashboard e análise
 */
export interface EvyHistoricoAgregado {
  // Total investido em aportes
  totalAportado: number;

  // Total recebido em dividendos
  totalDividendos: number;

  // Patrimônio acumulado
  patrimonioAcumulado: number;

  // Número de aportes
  quantidadeAportes: number;

  // Número de dividendos
  quantidadeDividendos: number;

  // Primeiro aporte
  primeiroAporte?: string; // ISO 8601

  // Último aporte
  ultimoAporte?: string; // ISO 8601

  // Média de aporte mensal
  mediaAporteMensal: number;
}

/**
 * Funções auxiliares para criar objetos padrão
 */

export function criarConfigPadrao(): EvyConfig {
  return {
    custoDeMessal: 5000,
    taxaAnualRetorno: 0.04,
    aporteMensalPadrao: 1000,
    ultimaAtualizacao: new Date().toISOString(),
  };
}

export function criarPatrimonioVazio(): EvyPatrimonio {
  return {
    valorTotal: 0,
    ultimaAtualizacao: new Date().toISOString(),
    historico: [],
  };
}

export function criarAppStateVazio(): EvyAppState {
  return {
    config: criarConfigPadrao(),
    patrimonio: criarPatrimonioVazio(),
    aportes: [],
    versao: "1.0.0",
    dataCriacao: new Date().toISOString(),
  };
}

export function criarSimuladorVazio(): EvySimuladorState {
  return {
    patrimonio: 0,
    custoDeMessal: 5000,
    aporteMensal: 1000,
    taxaAnualRetorno: 0.04,
    metricas: null,
  };
}
