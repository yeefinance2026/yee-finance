import { FreedomInput } from "./freedomEngine";
import { Investimento } from "../shared/investimento";
import { rendaPassivaAnual } from "./rendaEngine";

export interface ProjectionPoint {
    ano: number;
    patrimonio: number;
}

export interface ProjectionResult {
    anosAteIndependencia: number | null;
    patrimonioNecessario: number;
    timeline: ProjectionPoint[];
}

export interface ProjecaoAno {
    ano: number;
    patrimonioProjetado: number;
    rendaAnualProjetada: number;
    rendaMensalProjetada: number;
}

/**
 * Projeta o crescimento do patrimônio com aporte mensal
 */
export function projetarPatrimonio(
    investimentos: Investimento[],
    aporteMensal: number,
    taxaAnualMedia: number,
    anosMaximos: number = 10
): ProjecaoAno[] {
    const patrimonioInicial = investimentos.reduce(
        (sum, inv) => sum + inv.valorInvestido,
        0
    );
    const rendaAnualInicial = rendaPassivaAnual(investimentos);

    const projecoes: ProjecaoAno[] = [];
    let patrimonioAtual = patrimonioInicial;
    let rendaAnualAtual = rendaAnualInicial;

    for (let ano = 1; ano <= anosMaximos; ano++) {
        // Adiciona aportes mensais (12 meses)
        const aportesAnuais = aporteMensal * 12;
        patrimonioAtual += aportesAnuais;

        // Aplica juros compostos
        patrimonioAtual = patrimonioAtual * (1 + taxaAnualMedia);

        // Recalcula renda anual (assumindo mesma taxa)
        rendaAnualAtual = patrimonioAtual * taxaAnualMedia;

        projecoes.push({
            ano,
            patrimonioProjetado: patrimonioAtual,
            rendaAnualProjetada: rendaAnualAtual,
            rendaMensalProjetada: rendaAnualAtual / 12,
        });
    }

    return projecoes;
}

/**
 * Calcula quantos anos até atingir independência
 */
export function anosAteIndependencia(
    investimentos: Investimento[],
    aporteMensal: number,
    custoVidaMensal: number,
    taxaAnualMedia: number
): number | null {
    const projecoes = projetarPatrimonio(
        investimentos,
        aporteMensal,
        taxaAnualMedia,
        50
    );

    const primeiro = projecoes.find(
        (p) => p.rendaMensalProjetada >= custoVidaMensal
    );

    return primeiro ? primeiro.ano : null;
}

export function calcularProjecao(input: FreedomInput): ProjectionResult {
    const {
        patrimonio = 0,
        aporteMensal = 0,
        despesaMensal = 0,
        taxaAnualRetorno = 0,
    } = input;


    const taxaMensal = taxaAnualRetorno / 12;
    const patrimonioNecessario = despesaMensal * 12 * 25; // regra 4%

    let patrimonioAtual = patrimonio;
    const timeline: ProjectionPoint[] = [];

    let anos = 0;
    let meses = 0;

    while (anos < 100) {
        // aplica 12 meses
        for (let i = 0; i < 12; i++) {
            patrimonioAtual =
                patrimonioAtual * (1 + taxaMensal) + aporteMensal;

            meses++;
        }

        anos++;

        timeline.push({
            ano: anos,
            patrimonio: patrimonioAtual,
        });

        if (patrimonioAtual >= patrimonioNecessario) {
            return {
                anosAteIndependencia: anos,
                patrimonioNecessario,
                timeline,
            };
        }
    }

    return {
        anosAteIndependencia: null,
        patrimonioNecessario,
        timeline,
    };
}
