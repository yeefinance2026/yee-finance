import { useEffect, useState } from "react";
import { useFinancial } from "@/state/FinancialContext";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Settings,
  PieChart,
  Zap,
  Lock,
  Trophy,
  TrendingUp,
  Flame,
  RefreshCw
} from "lucide-react";
import { Link } from "wouter";
import { BottomNav } from "@/components/BottomNav";
import { formatCurrency } from "@/lib/utils";
import { calcularMesesParaIndependencia } from "@/lib/evyCalculations";
import { getGreeting } from "@/lib/getGreeting";
import { toast } from "sonner";

// Mensagens motivacionais baseadas no progresso
const MENSAGENS_MOTIVACIONAIS: { [key: number]: string } = {
  1: "Sua jornada começou 🚀",
  5: "Você já está à frente de muitos 💪",
  10: "Primeiro marco alcançado 🎯",
  25: "1/4 da liberdade conquistada ✨",
  50: "Metade da liberdade 🔥",
  75: "Quase lá! 🏁",
  100: "Liberdade financeira alcançada! 🎉"
};

function getMensagemMotivacional(progresso: number): string {
  for (const [threshold, message] of Object.entries(MENSAGENS_MOTIVACIONAIS).sort((a, b) => Number(b[0]) - Number(a[0]))) {
    if (progresso >= Number(threshold)) {
      return message;
    }
  }
  return "Sua jornada começa hoje.";
}

// Calcula o próximo marco
function getProximoMarco(progresso: number): number {
  const marcos = [5, 10, 25, 50, 75, 100];
  return marcos.find(m => m > progresso) || 100;
}

// Formata mês em português
function formatarMesAtual(): string {
  const data = new Date();
  return data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

interface Plano {
  tipo: "free" | "fundador";
}

export default function Home() {
  const { state, loadProfileFromSupabase } = useFinancial();
  const [forceUpdate, setForceUpdate] = useState(0);
  const [aceleradorCustom, setAceleradorCustom] = useState(0);
  const [aceleradorSelecionado, setAceleradorSelecionado] = useState<number | 'custom'>(200);
  const [isLoading, setIsLoading] = useState(true);
  const [greeting, setGreeting] = useState({ greeting: "", emoji: "" });
  const [plano, setPlano] = useState<Plano>({ tipo: "free" });
  const [patrimonioAnterior, setPatrimonioAnterior] = useState(0);
  const [atualizandoPatrimonio, setAtualizandoPatrimonio] = useState(false);

  // Carrega dados do Supabase na inicialização
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      await loadProfileFromSupabase();
      setIsLoading(false);
    };
    initializeData();
  }, [loadProfileFromSupabase]);

  // Atualiza a saudação quando o estado muda
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

  // Renda de juros
  const rendaJuros = state.investimentos
    .filter(inv => inv.tipoRendimento === "juros")
    .reduce((acc, inv) => acc + (inv.valor * (inv.taxaAnual / 100)) / 12, 0);

  // Dividendos do mês atual
  const mesAtual = new Date().toISOString().slice(0, 7);
  const dividendosMesAtual = (state.dividendos || []).filter(d => d.mes === mesAtual);
  const totalDividendosMes = dividendosMesAtual.reduce((acc, d) => acc + d.valor, 0);

  // Renda passiva total
  const rendaPassivaAtual = rendaJuros + totalDividendosMes;

  const progresso = metaMensal > 0 ? Math.min(100, (rendaPassivaAtual / metaMensal) * 100) : 0;
  const progressoRestante = 100 - progresso;
  const proximoMarco = getProximoMarco(progresso);

  // Patrimônio
  const patrimonioBase = (state.patrimonioAtual && state.patrimonioAtual > 0)
    ? state.patrimonioAtual
    : totalInvestido;

  // Cálculo de patrimônio necessário
  const taxaMensalPadrao = 0.006;
  const patrimonioNecessario = metaMensal > 0 ? metaMensal / taxaMensalPadrao : 0;
  const progressoPatrimonio = patrimonioNecessario > 0 ? Math.min(100, (patrimonioBase / patrimonioNecessario) * 100) : 0;

  const aporteMensalSeguro = state.aporteMensal || 0;
  const mesesRestantes = calcularMesesParaIndependencia(
    patrimonioBase,
    aporteMensalSeguro,
    taxaAnualSegura / 100,
    patrimonioNecessario
  );

  const anos = isFinite(mesesRestantes) ? Math.floor(mesesRestantes / 12) : 0;
  const meses = isFinite(mesesRestantes) ? Math.floor(mesesRestantes % 12) : 0;

  // Data de independência
  const dataIndependencia = new Date();
  dataIndependencia.setMonth(dataIndependencia.getMonth() + Math.floor(mesesRestantes));
  const dataFormatada = dataIndependencia.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  // ========== DESAFIO MENSAL ==========
  const investimentosMes = state.investimentos.filter(inv =>
    inv.dataAporte.startsWith(mesAtual)
  );
  const totalInvestidoMes = investimentosMes.reduce((acc, inv) => acc + inv.valor, 0);
  const metaMes = aporteMensalSeguro;
  const progressoDesafio = metaMes > 0 ? (totalInvestidoMes / metaMes) * 100 : 0;
  const faltaParaDesafio = Math.max(0, metaMes - totalInvestidoMes);
  const desafioCompleto = totalInvestidoMes >= metaMes;

  // ========== ATUALIZAR PATRIMÔNIO ==========
  const handleAtualizarPatrimonio = async () => {
    setAtualizandoPatrimonio(true);
    
    const crescimento = patrimonioBase - patrimonioAnterior;
    const mesesAntigos = calcularMesesParaIndependencia(
      patrimonioAnterior,
      aporteMensalSeguro,
      taxaAnualSegura / 100,
      patrimonioNecessario
    );
    const mesesNovos = mesesRestantes;
    const anosAdiantados = Math.floor((mesesAntigos - mesesNovos) / 12);
    const mesesAdiantados = Math.floor((mesesAntigos - mesesNovos) % 12);

    setTimeout(() => {
      if (crescimento > 0) {
        toast.success("🎉 Parabéns!", {
          description: `Seu patrimônio cresceu ${formatCurrency(crescimento)} este mês.\nVocê adiantou sua liberdade em ${anosAdiantados > 0 ? `${anosAdiantados} anos` : ''} ${mesesAdiantados > 0 ? `e ${mesesAdiantados} meses` : ''}!`,
        });
      } else if (crescimento === 0) {
        toast.info("Patrimônio sem alterações", {
          description: "Continue investindo para acelerar sua jornada.",
        });
      } else {
        toast.info("Patrimônio reduzido", {
          description: "Revise seus investimentos.",
        });
      }
      
      setPatrimonioAnterior(patrimonioBase);
      setAtualizandoPatrimonio(false);
    }, 500);
  };

  // Acelerador
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

  // Data com acelerador
  const dataComAcelerador = new Date();
  dataComAcelerador.setMonth(dataComAcelerador.getMonth() + Math.floor(mesesComAcelerador));
  const dataAceleradorFormatada = dataComAcelerador.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  // Formata valores sem centavos quando apropriado
  const formatarPatrimonio = (valor: number) => {
    return Math.round(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

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

      <main className="px-6 space-y-6 max-w-md mx-auto">
        {/* SAUDAÇÃO */}
        <section className="text-left space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">
            {greeting.emoji} {greeting.greeting}
          </h2>
          <p className="text-sm text-muted-foreground">
            Vamos acelerar sua jornada para a liberdade financeira.
          </p>
        </section>

        {/* NÚMERO DOMINANTE - SEM DUPLICAÇÃO */}
        <section className="text-center space-y-4 py-4">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Número Dominante</p>
            <h2 className="text-6xl font-bold tracking-tighter text-primary">
              {progresso.toFixed(1)}%
            </h2>
            <p className="text-muted-foreground font-bold text-lg">
              {getMensagemMotivacional(progresso)}
            </p>
          </div>

          {/* Progresso sem duplicação */}
          <div className="bg-accent/30 rounded-2xl p-4 space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-primary">{progresso.toFixed(1)}% conquistado</span>
                <span className="text-muted-foreground">{progressoRestante.toFixed(1)}% restante</span>
              </div>
              <Progress value={progresso} className="h-3" />
            </div>

            <p className="text-xs text-muted-foreground">
              {formatCurrency(rendaPassivaAtual)} / {formatCurrency(metaMensal)} de renda passiva
            </p>

            <div className="pt-2 border-t border-border/50">
              <p className="text-xs font-bold text-primary">
                Próximo marco: {proximoMarco}% da liberdade financeira
              </p>
            </div>

            <p className="text-xs text-muted-foreground italic">
              Continue investindo para acelerar sua jornada.
            </p>
          </div>
        </section>

        {/* 🔥 DESAFIO MENSAL DE APORTES */}
        <Card className={`border-2 ${desafioCompleto ? 'border-green-500/30 bg-green-500/5' : 'border-primary/20 bg-primary/5'}`}>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Flame className={`w-5 h-5 ${desafioCompleto ? 'text-green-600 fill-green-600' : 'text-primary'}`} />
              <h3 className={`text-sm font-bold uppercase tracking-widest ${desafioCompleto ? 'text-green-600' : 'text-primary'}`}>
                Desafio de {formatarMesAtual().split(' ')[0].charAt(0).toUpperCase() + formatarMesAtual().split(' ')[0].slice(1)}
              </h3>
            </div>

            {!desafioCompleto ? (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span>{formatCurrency(totalInvestidoMes)}</span>
                    <span className="text-muted-foreground">{formatCurrency(metaMes)}</span>
                  </div>
                  <Progress value={Math.min(100, progressoDesafio)} className="h-3" />
                </div>

                <p className="text-sm font-bold text-primary">
                  Você está a {formatCurrency(faltaParaDesafio)} de completar o desafio!
                </p>
              </>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-bold text-green-600">🎉 Desafio Completo!</p>
                <p className="text-xs text-green-600/70">Você investiu {formatCurrency(totalInvestidoMes)} em {formatarMesAtual().split(' ')[0]}. Continue assim!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* BOTÃO ATUALIZAR PATRIMÔNIO */}
        <button
          onClick={handleAtualizarPatrimonio}
          disabled={atualizandoPatrimonio}
          className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${atualizandoPatrimonio ? 'animate-spin' : ''}`} />
          Atualizar Patrimônio do Mês
        </button>

        {/* RENDA PASSIVA - SIMPLIFICADO */}
        <Card className="border border-border bg-card">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <PieChart className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Renda Passiva</span>
            </div>

            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{formatCurrency(rendaPassivaAtual)}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {formatCurrency(rendaPassivaAtual)} / {formatCurrency(metaMensal)}
              </p>
              <p className="text-xs font-bold text-muted-foreground mt-1">
                {progresso.toFixed(1)}% da meta
              </p>
            </div>

            <div className="pt-3 border-t border-border/50 flex justify-between text-[11px] font-medium text-muted-foreground">
              <span>{formatCurrency(rendaJuros)} juros</span>
              <span>{formatCurrency(totalDividendosMes)} dividendos</span>
            </div>
          </CardContent>
        </Card>

        {/* PATRIMÔNIO - SEM CENTAVOS */}
        <Card className="border border-border bg-card">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Patrimônio</span>
            </div>

            <div className="text-center space-y-2">
              <p className="text-3xl font-bold">{formatarPatrimonio(patrimonioBase)}</p>
              <p className="text-sm text-muted-foreground">
                {formatarPatrimonio(patrimonioBase)} / {formatarPatrimonio(patrimonioNecessario)}
              </p>
              <p className="text-xs font-bold text-primary">
                {progressoPatrimonio.toFixed(1)}% acumulado
              </p>
            </div>

            <div className="pt-3 border-t border-border/50">
              <Progress value={progressoPatrimonio} className="h-2 mb-2" />
              <p className="text-xs text-muted-foreground italic">
                Simulação baseada em rendimento médio de 0,6% ao mês.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* TEMPO PARA LIBERDADE - MELHORADO */}
        <Card className="border border-border bg-primary/5">
          <CardContent className="p-6 text-center space-y-2">
            <div className="flex justify-center items-center gap-2 text-muted-foreground mb-2">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Independência</span>
            </div>
            
            <p className="text-sm font-medium">Você está a</p>
            <h3 className="text-4xl font-bold tracking-tight text-primary">
              {anos} anos
            </h3>
            <p className="text-xs text-muted-foreground">de viver de renda.</p>

            <div className="pt-3 border-t border-border/50 space-y-1">
              <p className="text-xs font-bold uppercase text-muted-foreground">Independência estimada:</p>
              <p className="text-sm font-bold text-primary">{dataFormatada}</p>
            </div>
          </CardContent>
        </Card>

        {/* ACELERADOR YEE - REFORÇADO */}
        <Card className="border-2 border-primary/20 bg-primary/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2">
            <Zap className="w-5 h-5 text-primary fill-primary/20" />
          </div>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-bold text-primary uppercase tracking-widest">⚡ Acelerador Yee</p>
              <p className="text-xs text-muted-foreground">Quanto você quer acelerar sua liberdade?</p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => { setAceleradorSelecionado(100 as number | 'custom'); setAceleradorCustom(0); }}
                className={`py-2 px-3 rounded-lg font-bold text-sm transition-all ${aceleradorSelecionado === 100 ? 'bg-primary text-primary-foreground' : 'bg-primary/20 text-primary hover:bg-primary/30'}`}
              >
                +R$ 100
              </button>
              <button
                onClick={() => { setAceleradorSelecionado(200 as number | 'custom'); setAceleradorCustom(0); }}
                className={`py-2 px-3 rounded-lg font-bold text-sm transition-all ${aceleradorSelecionado === 200 ? 'bg-primary text-primary-foreground' : 'bg-primary/20 text-primary hover:bg-primary/30'}`}
              >
                +R$ 200
              </button>
              <button
                onClick={() => plano.tipo === "fundador" ? (setAceleradorSelecionado(500 as number | 'custom'), setAceleradorCustom(0)) : toast.info("Disponível no plano Fundador")}
                className={`py-2 px-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-1 relative ${
                  plano.tipo === "free"
                    ? 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/30 cursor-not-allowed'
                    : aceleradorSelecionado === 500 ? 'bg-primary text-primary-foreground' : 'bg-primary/20 text-primary hover:bg-primary/30'
                }`}
              >
                +R$ 500
                {plano.tipo === "free" && <Lock className="w-3 h-3" />}
              </button>
            </div>

            {/* Personalizar com bloqueio */}
            <button
              onClick={() => plano.tipo === "fundador" ? setAceleradorSelecionado('custom') : toast.info("Disponível no plano Fundador")}
              className={`w-full py-2 px-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                aceleradorSelecionado === 'custom'
                  ? 'bg-primary text-primary-foreground'
                  : plano.tipo === "fundador"
                  ? 'bg-primary/20 text-primary hover:bg-primary/30'
                  : 'bg-accent/30 text-muted-foreground cursor-not-allowed'
              }`}
            >
              Personalizar
              {plano.tipo === "free" && <Lock className="w-3 h-3" />}
            </button>

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
              <div className="pt-4 border-t border-primary/20 space-y-3">
                <div className="bg-primary/10 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-bold uppercase text-primary">Com +R${valorAcelerador.toLocaleString('pt-BR')}/mês</p>
                  <div className="space-y-1">
                    <p className="text-sm font-bold">Nova independência:</p>
                    <p className="text-2xl font-bold text-primary">{dataAceleradorFormatada}</p>
                  </div>
                </div>

                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
                    <Zap className="w-5 h-5" />
                    <span>⚡ Você ganha {economiaAnos > 0 ? `${economiaAnos} anos` : ''} {economiaMesesResto > 0 ? `e ${economiaMesesResto} meses` : ''} de liberdade financeira</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground italic text-center">
                  Pequenos aportes hoje podem antecipar anos da sua liberdade financeira.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ANOS ECONOMIZADOS - REFORÇADO */}
        {valorAcelerador > 0 && (
          <Card className="border-2 border-yellow-500/30 bg-yellow-500/5">
            <CardContent className="p-6 text-center space-y-2">
              <Trophy className="w-8 h-8 text-yellow-600 mx-auto" />
              <p className="text-xs font-bold uppercase text-yellow-600">⚡ Total de anos economizados</p>
              <p className="text-3xl font-bold text-yellow-600">
                {economiaAnos > 0 ? `${economiaAnos}` : '0'} {economiaMesesResto > 0 ? `anos e ${economiaMesesResto} meses` : 'anos'}
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  );
}