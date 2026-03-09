import { useEffect, useState } from "react";
import { useFinancial } from "@/state/FinancialContext";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  ArrowRight,
  Settings,
  PieChart,
  BarChart2,
  Zap,
  Target,
  Lock,
  Trophy,
  TrendingUp
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
  const [showAtualizarPatrimonio, setShowAtualizarPatrimonio] = useState(false);
  const [patrimonioAtualizado, setPatrimonioAtualizado] = useState("");

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
  const faltaMensal = Math.max(0, metaMensal - rendaPassivaAtual);
  const progressoRestante = 100 - progresso;

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

  const handleAtualizarPatrimonio = () => {
    if (!patrimonioAtualizado) {
      toast.error("Digite um valor para atualizar");
      return;
    }
    const valor = Number(patrimonioAtualizado);
    const novoPatrimonio = patrimonioBase + valor;
    toast.success(`🎉 Atualização concluída!\nSeu patrimônio subiu de ${formatCurrency(patrimonioBase)} para ${formatCurrency(novoPatrimonio)}`);
    setPatrimonioAtualizado("");
    setShowAtualizarPatrimonio(false);
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

        {/* NÚMERO DOMINANTE COM GAMIFICAÇÃO */}
        <section className="text-center space-y-4 py-6">
          <div className="space-y-2">
            <h2 className="text-6xl font-bold tracking-tighter text-primary">
              {progresso.toFixed(0)}%
            </h2>
            <p className="text-muted-foreground font-bold text-lg">
              {getMensagemMotivacional(progresso)}
            </p>
          </div>

          {/* Progresso tangível */}
          <div className="bg-accent/30 rounded-2xl p-4 space-y-2">
            <div className="flex justify-between text-sm font-bold">
              <span className="text-primary">{progresso.toFixed(1)}% conquistado</span>
              <span className="text-muted-foreground">{progressoRestante.toFixed(1)}% restante</span>
            </div>
            <Progress value={progresso} className="h-3" />
            <p className="text-xs text-muted-foreground pt-2">
              {formatCurrency(rendaPassivaAtual)} / {formatCurrency(metaMensal)} de renda passiva
            </p>
          </div>
        </section>

        {/* SITUAÇÃO ATUAL */}
        <Card className="border border-border bg-card">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <PieChart className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Renda Passiva</span>
            </div>

            <div className="text-center space-y-2">
              <p className="text-3xl font-bold text-primary">{formatCurrency(rendaPassivaAtual)}</p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(rendaPassivaAtual)} / {formatCurrency(metaMensal)}
              </p>
              <p className="text-xs font-bold text-muted-foreground">
                {progresso.toFixed(1)}% da meta
              </p>
            </div>

            <div className="pt-3 border-t border-border/50 flex justify-between text-[11px] font-medium text-muted-foreground">
              <span>{formatCurrency(rendaJuros)} juros</span>
              <span>{formatCurrency(totalDividendosMes)} dividendos</span>
            </div>
          </CardContent>
        </Card>

        {/* PATRIMÔNIO */}
        <Card className="border border-border bg-card">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Patrimônio</span>
            </div>

            <div className="text-center space-y-2">
              <p className="text-3xl font-bold">{formatCurrency(patrimonioBase)}</p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(patrimonioBase)} / {formatCurrency(patrimonioNecessario)}
              </p>
              <p className="text-xs font-bold text-primary">
                {progressoPatrimonio.toFixed(1)}% acumulado
              </p>
            </div>

            <div className="pt-3 border-t border-border/50">
              <p className="text-[10px] text-muted-foreground italic">
                Simulação baseada em rendimento médio de 0,6% ao mês.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* TEMPO PARA LIBERDADE */}
        <Card className="border border-border bg-primary/5">
          <CardContent className="p-6 text-center space-y-3">
            <div className="flex justify-center items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Independência Estimada</span>
            </div>
            <p className="text-sm font-medium">Você está a</p>
            <h3 className="text-4xl font-bold tracking-tight text-primary">
              {anos} anos e {meses} meses
            </h3>
            <p className="text-sm font-bold text-primary">{dataFormatada}</p>
            <p className="text-xs text-muted-foreground">de viver de renda</p>
          </CardContent>
        </Card>

        {/* ACELERADOR YEE */}
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
                onClick={() => { setAceleradorSelecionado(500 as number | 'custom'); setAceleradorCustom(0); }}
                className={`py-2 px-3 rounded-lg font-bold text-sm transition-all ${aceleradorSelecionado === 500 ? 'bg-primary text-primary-foreground' : 'bg-primary/20 text-primary hover:bg-primary/30'}`}
              >
                +R$ 500
              </button>
            </div>

            {/* Personalizar com bloqueio */}
            <div className="relative">
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
              <div className="pt-4 border-t border-primary/20 space-y-3">
                <div className="bg-primary/10 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-bold uppercase text-primary">Com +R${valorAcelerador.toLocaleString('pt-BR')}/mês</p>
                  <div className="space-y-1">
                    <p className="text-sm font-bold">Nova independência</p>
                    <p className="text-2xl font-bold text-primary">{dataAceleradorFormatada}</p>
                  </div>
                </div>

                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-green-600 font-bold">
                    <Zap className="w-5 h-5" />
                    <span>Você ganha {economiaAnos > 0 ? `${economiaAnos} anos` : ''} {economiaMesesResto > 0 ? `e ${economiaMesesResto} meses` : ''} de liberdade</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground italic text-center">
                  Pequenos aportes hoje podem antecipar anos da sua liberdade.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ANOS ECONOMIZADOS */}
        {valorAcelerador > 0 && (
          <Card className="border-2 border-yellow-500/30 bg-yellow-500/5">
            <CardContent className="p-6 text-center space-y-2">
              <Trophy className="w-8 h-8 text-yellow-600 mx-auto" />
              <p className="text-xs font-bold uppercase text-yellow-600">⚡ Anos economizados</p>
              <p className="text-3xl font-bold text-yellow-600">
                {economiaAnos > 0 ? `${economiaAnos}` : '0'} {economiaMesesResto > 0 ? `anos e ${economiaMesesResto} meses` : 'anos'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* ATUALIZAR PATRIMÔNIO */}
        <Card className="border border-border bg-accent/30">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Atualizar Patrimônio</span>
            </div>

            {!showAtualizarPatrimonio ? (
              <button
                onClick={() => setShowAtualizarPatrimonio(true)}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
              >
                Atualizar patrimônio do mês
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">R$</span>
                  <input
                    type="number"
                    value={patrimonioAtualizado}
                    onChange={(e) => setPatrimonioAtualizado(e.target.value)}
                    placeholder="Quanto você investiu?"
                    className="w-full bg-background border border-border rounded-lg py-3 pl-10 pr-4 font-bold focus:ring-2 ring-primary outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAtualizarPatrimonio(false)}
                    className="flex-1 py-2 bg-accent text-accent-foreground rounded-lg font-bold transition-colors hover:bg-accent/80"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAtualizarPatrimonio}
                    className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg font-bold transition-colors hover:scale-[1.02]"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            )}

            <p className="text-[10px] text-muted-foreground text-center">
              Atualize mensalmente para manter seu progresso sincronizado.
            </p>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}