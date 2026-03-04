import { useEffect, useState } from "react";
import { useFinancial } from "@/state/FinancialContext";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Calendar,
  DollarSign,
  ArrowRight,
  Settings,
  PieChart,
  Landmark,
  BarChart2,
  Zap,
  Target
} from "lucide-react";
import { Link } from "wouter";
import { BottomNav } from "@/components/BottomNav";
import { formatCurrency } from "@/lib/utils";
import { calcularMesesParaIndependencia } from "@/lib/evyCalculations";
import { getGreeting } from "@/lib/getGreeting";

export default function Home() {
  const { state, loadProfileFromSupabase } = useFinancial();
  const [forceUpdate, setForceUpdate] = useState(0);
  const [aceleradorCustom, setAceleradorCustom] = useState(0);
  const [aceleradorSelecionado, setAceleradorSelecionado] = useState<number | 'custom'>(200);
  const [isLoading, setIsLoading] = useState(true);
  const [greeting, setGreeting] = useState({ greeting: "", emoji: "" });
  const userName = localStorage.getItem("evy_user_name") || "";

  // Carrega dados do Supabase na inicialização
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      await loadProfileFromSupabase();
      setIsLoading(false);
    };
    initializeData();
  }, [loadProfileFromSupabase]);

  // Atualiza a saudação quando o estado muda (pega o nome do state)
  useEffect(() => {
    const userName = state.profile?.name || localStorage.getItem("evy_user_name") || "";
    setGreeting(getGreeting(userName));
    const interval = setInterval(() => {
      setGreeting(getGreeting(userName));
    }, 60000);
    return () => clearInterval(interval);
  }, [state.profile?.name]);


  // Força recálculo quando o estado muda
  useEffect(() => {
    setForceUpdate(prev => prev + 1);
  }, [state.numeroLiberdade, state.aporteMensal, state.taxaAnual, state.patrimonioAtual]);

  const totalInvestido = state.investimentos.reduce((acc, inv) => acc + (inv.valor || 0), 0);
  const metaMensal = state.numeroLiberdade || 1;
  const taxaAnualSegura = state.taxaAnual || 8;

  // Renda de juros (calculada automaticamente pela taxa anual)
  const rendaJuros = state.investimentos
    .filter(inv => inv.tipoRendimento === "juros")
    .reduce((acc, inv) => acc + (inv.valor * (inv.taxaAnual / 100)) / 12, 0);

  // Dividendos do mês atual (lançados manualmente)
  const mesAtual = new Date().toISOString().slice(0, 7);
  const dividendosMesAtual = (state.dividendos || []).filter(d => d.mes === mesAtual);
  const totalDividendosMes = dividendosMesAtual.reduce((acc, d) => acc + d.valor, 0);

  // Renda passiva total = juros + dividendos manuais
  const rendaPassivaAtual = rendaJuros + totalDividendosMes;

  const progresso = metaMensal > 0 ? Math.min(100, (rendaPassivaAtual / metaMensal) * 100) : 0;
  const faltaMensal = Math.max(0, metaMensal - rendaPassivaAtual);

  // Patrimônio: usa o valor manual se definido, senão soma dos investimentos
  const patrimonioBase = (state.patrimonioAtual && state.patrimonioAtual > 0)
    ? state.patrimonioAtual
    : totalInvestido;

  // Cálculo de patrimônio necessário baseado em 0.6% ao mês (padrão Yee Finance)
  const taxaMensalPadrao = 0.006;
  const patrimonioNecessario = metaMensal > 0 ? metaMensal / taxaMensalPadrao : 0;

  const aporteMensalSeguro = state.aporteMensal || 0;
  const mesesRestantes = calcularMesesParaIndependencia(
    patrimonioBase,
    aporteMensalSeguro,
    taxaAnualSegura / 100,
    patrimonioNecessario
  );

  const anos = isFinite(mesesRestantes) ? Math.floor(mesesRestantes / 12) : 0;
  const meses = isFinite(mesesRestantes) ? Math.floor(mesesRestantes % 12) : 0;

  // Acelerador selecionado (200, 500 ou custom)
  const valorAcelerador = aceleradorSelecionado === 'custom' ? aceleradorCustom : (aceleradorSelecionado as number);
  const mesesComAcelerador = calcularMesesParaIndependencia(
    patrimonioBase,
    aporteMensalSeguro + valorAcelerador,
    taxaAnualSegura / 100,
    patrimonioNecessario
  );
  const economiaMeses = Math.max(0, mesesRestantes - mesesComAcelerador);
  const economiaAnos = Math.floor(economiaMeses / 12);
  const economiaMesesResto = Math.floor(economiaMeses % 12);

  // Dependência do forceUpdate garante que o componente re-renderize quando necessário
  void forceUpdate;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold mx-auto mb-4">Y</div>
          <p className="text-muted-foreground">Carregando seus dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="p-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">Y</div>
          <h1 className="text-xl font-bold tracking-tight">Yee Finance</h1>
        </div>
        <Link href="/configuracoes">
          <button className="p-2 hover:bg-accent rounded-full transition-colors">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
        </Link>
      </header>

      <main className="px-6 space-y-8 max-w-md mx-auto">
        {/* BLOCO 0 — SAUDAÇÃO PERSONALIZADA */}
        <section className="text-left space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">
            {greeting.emoji} {greeting.greeting}
          </h2>
          <p className="text-sm text-muted-foreground">
            Vamos acelerar sua jornada para a liberdade financeira.
          </p>
        </section>

        {/* BLOCO 1 — NÚMERO DOMINANTE */}
        <section className="text-center space-y-4 py-4">
          <h2 className="text-6xl font-bold tracking-tighter text-primary">
            {progresso.toFixed(0)}%
          </h2>
          <p className="text-muted-foreground font-bold text-lg">
            {progresso === 0 ? "Sua jornada começa hoje." : "da sua liberdade conquistada"}
          </p>

          <div className="space-y-2 pt-2">
            <Progress value={progresso} className="h-3" />
          </div>
        </section>

        {/* BLOCO 2 — SITUAÇÃO ATUAL */}
        <Card className="border border-border bg-card">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <PieChart className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Situação Atual</span>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Meta mensal: <span className="text-foreground font-bold">{formatCurrency(metaMensal)}</span></p>
              <p className="text-sm text-muted-foreground">Renda passiva atual: <span className="text-primary font-bold">{formatCurrency(rendaPassivaAtual)}</span></p>
            </div>

            <div className="pt-3 border-t border-border/50 flex justify-between text-[11px] font-medium text-muted-foreground italic">
              <span>({formatCurrency(rendaJuros)} juros + {formatCurrency(totalDividendosMes)} dividendos)</span>
            </div>
          </CardContent>
        </Card>

        {/* BLOCO 3 — PRÓXIMO PASSO */}
        <Card className="border border-border bg-card">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Target className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Próximo Passo</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-primary">+{formatCurrency(faltaMensal)} por mês</h3>
              <p className="text-xs text-muted-foreground font-medium">Renda necessária para alcançar sua independência.</p>
            </div>

            <div className="pt-4 border-t border-border/50 space-y-3">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Patrimônio necessário para independência:</p>
                <p className="text-xl font-bold">{formatCurrency(patrimonioNecessario)}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[10px] text-muted-foreground italic max-w-[180px]">
                  Simulação baseada em rendimento médio de 0,6% ao mês.
                </p>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Patrimônio atual:</p>
                  <p className="text-sm font-bold text-primary">{formatCurrency(patrimonioBase)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BLOCO 4 — TEMPO ESTIMADO */}
        <Card className="border border-border bg-primary/5">
          <CardContent className="p-6 text-center space-y-3">
            <div className="flex justify-center items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Tempo Estimado</span>
            </div>
            <p className="text-sm font-medium">Independência financeira em:</p>
            <h3 className="text-4xl font-bold tracking-tight text-primary">
              {anos} anos e {meses} meses
            </h3>
          </CardContent>
        </Card>

        {/* BLOCO 5 — ACELERADOR YEE */}
        <Card className="border-2 border-primary/20 bg-primary/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2">
            <Zap className="w-5 h-5 text-primary fill-primary/20" />
          </div>
          <CardContent className="p-6 space-y-4">
            <p className="text-sm font-bold text-primary uppercase tracking-widest">Acelerador Yee</p>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => { setAceleradorSelecionado(200 as number | 'custom'); setAceleradorCustom(0); }}
                className={`py-2 px-3 rounded-lg font-bold text-sm transition-all ${aceleradorSelecionado === 200 ? 'bg-primary text-primary-foreground' : 'bg-primary/20 text-primary hover:bg-primary/30'}`}
              >
                +R$ 200
              </button>
              <button
                onClick={() => { setAceleradorSelecionado(500 as number | 'custom'); setAceleradorCustom(0); }}
                className={`py-2 px-3 rounded-lg font-bold text-sm transition-all ${aceleradorSelecionado === 500 ? 'bg-primary text-primary-foreground' : 'bg-primary/20 text-primary hover:bg-primary/30'}`}
              >
                +R$ 500
              </button>
              <button
                onClick={() => setAceleradorSelecionado('custom')}
                className={`py-2 px-3 rounded-lg font-bold text-sm transition-all ${aceleradorSelecionado === 'custom' ? 'bg-primary text-primary-foreground' : 'bg-primary/20 text-primary hover:bg-primary/30'}`}
              >
                Personalizar
              </button>
            </div>

            {aceleradorSelecionado === 'custom' && (
              <div className="space-y-2">
                <input
                  type="number"
                  value={aceleradorCustom}
                  onChange={(e) => setAceleradorCustom(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-primary/10 border border-primary/30 rounded-lg text-primary font-bold"
                  placeholder="Valor personalizado"
                />
              </div>
            )}

            {valorAcelerador > 0 && (
              <div className="pt-2 border-t border-primary/20">
                <p className="text-sm text-muted-foreground mb-2">
                  Se investir <span className="font-bold text-primary">+R$ {valorAcelerador.toLocaleString('pt-BR')}</span>/mês:
                </p>
                <div className="flex items-center gap-2 text-primary font-bold text-lg">
                  <ArrowRight className="w-5 h-5" />
                  <span>Anteciparia sua liberdade em {economiaAnos > 0 ? `${economiaAnos} anos e ` : ''}{Math.floor(economiaMesesResto)} meses.</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}