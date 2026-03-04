/**
 * 🧪 TESTES DO FREEDOM ENGINE
 * 
 * Validação com cenários reais antes de usar como produto
 */

import { calcularFreedom, FreedomInput } from "./freedomEngine";

interface TestCase {
  nome: string;
  input: FreedomInput;
  validacoes: {
    diasDeLiberdadeHoje: (dias: number) => boolean;
    rendaMensalAtual: (renda: number) => boolean;
    patrimonioNecessario: (patrimonio: number) => boolean;
    percentualProgresso: (percentual: number) => boolean;
  };
}

const testCases: TestCase[] = [
  {
    nome: "Cenário 1: Iniciante com R$ 50k",
    input: {
      patrimonio: 50000,
      aporteMensal: 1000,
      despesaMensal: 5000,
      taxaAnualRetorno: 0.04,
      horizontes: [1, 3, 5, 10],
    },
    validacoes: {
      diasDeLiberdadeHoje: (dias) => dias === 300, // 50k / 5k * 30 = 300
      rendaMensalAtual: (renda) => renda === 167, // 50k * 0.04 / 12 = 166.67
      patrimonioNecessario: (patrimonio) => patrimonio === 1500000, // 5k / (0.04/12)
      percentualProgresso: (percentual) => percentual === 3.33, // 50k / 1.5M * 100
    },
  },
  {
    nome: "Cenário 2: Intermediário com R$ 500k",
    input: {
      patrimonio: 500000,
      aporteMensal: 2000,
      despesaMensal: 5000,
      taxaAnualRetorno: 0.06,
      horizontes: [1, 3, 5, 10],
    },
    validacoes: {
      diasDeLiberdadeHoje: (dias) => dias === 3000, // 500k / 5k * 30 = 3000
      rendaMensalAtual: (renda) => renda === 2500, // 500k * 0.06 / 12 = 2500
      patrimonioNecessario: (patrimonio) => patrimonio === 1000000, // 5k / (0.06/12)
      percentualProgresso: (percentual) => percentual === 50, // 500k / 1M * 100
    },
  },
  {
    nome: "Cenário 3: Avançado com R$ 1.5M (já independente)",
    input: {
      patrimonio: 1500000,
      aporteMensal: 5000,
      despesaMensal: 5000,
      taxaAnualRetorno: 0.05,
      horizontes: [1, 3, 5, 10],
    },
    validacoes: {
      diasDeLiberdadeHoje: (dias) => dias === 9000, // 1.5M / 5k * 30 = 9000
      rendaMensalAtual: (renda) => renda === 6250, // 1.5M * 0.05 / 12 = 6250
      patrimonioNecessario: (patrimonio) => patrimonio === 1200000, // 5k / (0.05/12)
      percentualProgresso: (percentual) => percentual === 100, // 1.5M / 1.2M * 100 (capped)
    },
  },
  {
    nome: "Cenário 4: Conservador (taxa 3%)",
    input: {
      patrimonio: 100000,
      aporteMensal: 500,
      despesaMensal: 3000,
      taxaAnualRetorno: 0.03,
      horizontes: [1, 3, 5, 10],
    },
    validacoes: {
      diasDeLiberdadeHoje: (dias) => dias === 1000, // 100k / 3k * 30 = 1000
      rendaMensalAtual: (renda) => renda === 250, // 100k * 0.03 / 12 = 250
      patrimonioNecessario: (patrimonio) => patrimonio === 1200000, // 3k / (0.03/12)
      percentualProgresso: (percentual) => percentual === 8.33, // 100k / 1.2M * 100
    },
  },
  {
    nome: "Cenário 5: Agressivo (taxa 8%)",
    input: {
      patrimonio: 200000,
      aporteMensal: 3000,
      despesaMensal: 4000,
      taxaAnualRetorno: 0.08,
      horizontes: [1, 3, 5, 10],
    },
    validacoes: {
      diasDeLiberdadeHoje: (dias) => dias === 1500, // 200k / 4k * 30 = 1500
      rendaMensalAtual: (renda) => renda === 1333, // 200k * 0.08 / 12 = 1333.33
      patrimonioNecessario: (patrimonio) => patrimonio === 600000, // 4k / (0.08/12)
      percentualProgresso: (percentual) => percentual === 33.33, // 200k / 600k * 100
    },
  },
];

export function rodarTestes(): void {
  console.log("🧪 INICIANDO TESTES DO FREEDOM ENGINE\n");

  let passaram = 0;
  let falharam = 0;

  testCases.forEach((testCase) => {
    console.log(`\n📋 ${testCase.nome}`);
    console.log("─".repeat(60));

    const resultado = calcularFreedom(testCase.input);

    // Teste 1: Dias de liberdade
    const diasOk = testCase.validacoes.diasDeLiberdadeHoje(
      resultado.diasDeLiberdadeHoje
    );
    console.log(
      `  ${diasOk ? "✅" : "❌"} Dias: ${resultado.diasDeLiberdadeHoje} (esperado: ${testCase.input.patrimonio / testCase.input.despesaMensal * 30})`
    );
    diasOk ? passaram++ : falharam++;

    // Teste 2: Renda mensal
    const rendaOk = testCase.validacoes.rendaMensalAtual(
      resultado.rendaMensalAtual
    );
    console.log(
      `  ${rendaOk ? "✅" : "❌"} Renda: R$ ${resultado.rendaMensalAtual} (esperado: ~${testCase.input.patrimonio * testCase.input.taxaAnualRetorno / 12})`
    );
    rendaOk ? passaram++ : falharam++;

    // Teste 3: Patrimônio necessário
    const patrimonioOk = testCase.validacoes.patrimonioNecessario(
      resultado.patrimonioNecessario
    );
    console.log(
      `  ${patrimonioOk ? "✅" : "❌"} Patrimônio necessário: R$ ${resultado.patrimonioNecessario} (esperado: ${testCase.input.despesaMensal / (testCase.input.taxaAnualRetorno / 12)})`
    );
    patrimonioOk ? passaram++ : falharam++;

    // Teste 4: Percentual progresso
    const percentualOk = testCase.validacoes.percentualProgresso(
      resultado.percentualProgresso
    );
    console.log(
      `  ${percentualOk ? "✅" : "❌"} Progresso: ${resultado.percentualProgresso}% (esperado: ${testCase.input.patrimonio / resultado.patrimonioNecessario * 100}%)`
    );
    percentualOk ? passaram++ : falharam++;

    // Teste 5: Projeções existem
    const projecoesOk = resultado.projections.length > 0;
    console.log(
      `  ${projecoesOk ? "✅" : "❌"} Projeções: ${resultado.projections.length} anos`
    );
    projecoesOk ? passaram++ : falharam++;

    // Teste 6: Meses para liberdade
    const mesesOk =
      resultado.mesesParaLiberdade === Infinity ||
      resultado.mesesParaLiberdade >= 0;
    console.log(
      `  ${mesesOk ? "✅" : "❌"} Meses para liberdade: ${resultado.mesesParaLiberdade === Infinity ? "∞" : resultado.mesesParaLiberdade}`
    );
    mesesOk ? passaram++ : falharam++;
  });

  console.log("\n" + "═".repeat(60));
  console.log(`\n📊 RESULTADO FINAL`);
  console.log(`✅ Passaram: ${passaram}`);
  console.log(`❌ Falharam: ${falharam}`);
  console.log(`📈 Taxa de sucesso: ${((passaram / (passaram + falharam)) * 100).toFixed(1)}%\n`);

  if (falharam === 0) {
    console.log("🎉 TODOS OS TESTES PASSARAM! Core está confiável.\n");
  } else {
    console.log("⚠️ Alguns testes falharam. Revisar Core.\n");
  }
}

// Executar testes se rodado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  rodarTestes();
}
