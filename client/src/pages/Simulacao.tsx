import { useState } from "react";
import { useFinancial } from "@/state/FinancialContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ChevronLeft, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  ArrowRight,
  RefreshCcw,
  CheckCircle2,
  PieChart,
  AlertCircle,
  Lock,
  Info,
  Zap,
} from "lucide-react";
import { Link } from "wouter";
import { formatCurrency } from "@/lib/utils";
import { calcularMesesParaIndependencia } from "@/lib/evyCalculations";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function Simulacao() {
    const { state, setNumeroLiberdade, setAporteMensal, setTaxaAnual, setPatrimonioAtual } = useFinancial();
  const planoTipo = state.profile?.plan || "free";
  const isFounder = planoTipo === "founder";
  
  // Simulation parameters (local, não afetam a home até confirmar)
  const [meta, setMeta] = useState(state.numeroLiberdade);
  const [aporte, setAporte] = useState(state.aporteMensal);
  const [taxa, setTaxa] = useState(state.taxaAnual);
  const [aporteExtra, setAporteExtra] = useState(0);
  const [patrimonioSim, setPatrimonioSim] = useState(
    state.patrimonioAtual && state.patrimonioAtual > 0 
      ? state.patrimonioAtual 
      : state.investimentos.reduce((acc, inv) => acc + inv.valor, 0)
  );

  // Modal de confirmação
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const totalInvestido = state.investimentos.reduce((acc, inv) => acc + (inv.valor || 0), 0);
  const patrimonioBase = (state.patrimonioAtual && state.patrimonioAtual > 0) 
    ? state.patrimonioAtual 
    : totalInvestido;
  
  // Current Scenario
  const taxaMensalPadrao = 0.006;
  const metaSegura = state.numeroLiberdade || 1;
  const aporteSeguro = state.aporteMensal || 0;
  const taxaSegura = state.taxaAnual || 8;
  const patrimonioNecessarioAtual = metaSegura > 0 ? metaSegura / taxaMensalPadrao : 0;
  const mesesAtual = (() => {
    const m = calcularMesesParaIndependencia(
      patrimonioBase, aporteSeguro, taxaSegura / 100, patrimonioNecessarioAtual
    );
    return isFinite(m) ? m : 0;
  })();
  
  const dataAtual = new Date();
  dataAtual.setMonth(dataAtual.getMonth() + mesesAtual);
  const dataFormatadaAtual = dataAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  // New Scenario
  const metaNova = meta || 1;
  const taxaNova = taxa || 8;
  const patrimonioNecessarioNovo = metaNova > 0 ? metaNova / taxaMensalPadrao : 0;
  const mesesNovo = (() => {
    const m = calcularMesesParaIndependencia(
      patrimonioSim, aporte + aporteExtra, taxaNova / 100, patrimonioNecessarioNovo
    );
    return isFinite(m) ? m : 0;
  })();
  
  const dataNova = new Date();
  dataNova.setMonth(dataNova.getMonth() + mesesNovo);
  const dataFormatadaNova = dataNova.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const diferencaMeses = Math.max(0, mesesAtual - mesesNovo);
  const diferencaAnos = Math.floor(Math.abs(diferencaMeses) / 12);
  const diferencaMesesResto = Math.abs(diferencaMeses) % 12;

  // Simulação com +R$200
  const mesesComPlus200 = (() => {
    const m = calcularMesesParaIndependencia(
      patrimonioSim, aporte + 200, taxaNova / 100, patrimonioNecessarioNovo
    );
    return isFinite(m) ? m : 0;
  })();
  const economiaComPlus200 = mesesNovo - mesesComPlus200;

  // Verifica se há mudanças em relação ao estado atual
  const temMudancas = 
    meta !== state.numeroLiberdade || 
    aporte !== state.aporteMensal || 
    taxa !== state.taxaAnual ||
    patrimonioSim !== patrimonioBase;

  const handleAplicar = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirmar = () => {
    setNumeroLiberdade(meta);
    setAporteMensal(aporte);
    setTaxaAnual(taxa);
    setPatrimonioAtual(patrimonioSim);
    setIsConfirmOpen(false);
    toast.success("Configurações aplicadas à Home com sucesso!");
  };

  const handlePremiumFeature = () => {
    if (!isFounder) {
      toast.info("Disponível apenas para o plano Fundador", {
      description: "Desbloqueie simulações avançadas.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="p-6 flex items-center gap-4">
        <Link href="/app">
          <button className="p-2 hover:bg-accent rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
        </Link>
        <h1 className="text-xl font-bold">Simulador</h1>
      </header>

      <main className="px-6 space-y-8 max-w-md mx-auto">
        {/* 1️⃣ CENÁRIO ATUAL */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Cenário Atual</h3>
          <Card className="border border-border bg-card">
            <CardContent className="p-6 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Independência financeira em</p>
                <p className="text-2xl font-bold capitalize">{dataFormatadaAtual}</p>
              </div>
              <div className="pt-3 border-t border-border/50">
                <p className="text-xs text-muted-foreground">{Math.floor(mesesAtual/12)} anos e {mesesAtual%12} meses a partir de hoje</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 2️⃣ NOVO CENÁRIO - TÍTULO */}
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Novo Cenário</h3>

        {/* 3️⃣ PARÂMETROS - FREE */}
        <Card className="border border-border bg-card">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <RefreshCcw className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Ajuste os parâmetros</span>
            </div>
            
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Meta de Renda (R$/mês)</Label>
                <Input 
                  type="number" 
                  value={meta || ''} 
                  onChange={(e) => setMeta(e.target.value === '' ? 0 : Number(e.target.value))} 
                  className="rounded-xl py-6 bg-background" 
                />
                {meta !== state.numeroLiberdade && (
                  <p className="text-[10px] text-primary font-bold">
                    Atual na Home: {formatCurrency(state.numeroLiberdade)}/mês
                  </p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Patrimônio Atual (R$)</Label>
                <Input 
                  type="number" 
                  value={patrimonioSim || ''} 
                  onChange={(e) => setPatrimonioSim(e.target.value === '' ? 0 : Number(e.target.value))} 
                  className="rounded-xl py-6 bg-background" 
                />
                {patrimonioSim !== patrimonioBase && (
                  <p className="text-[10px] text-primary font-bold">
                    Atual na Home: {formatCurrency(patrimonioBase)}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Aporte mensal (R$/mês)</Label>
                <Input 
                  type="number" 
                  value={aporte || ''} 
                  onChange={(e) => setAporte(e.target.value === '' ? 0 : Number(e.target.value))} 
                  className="rounded-xl py-6 bg-background" 
                />
                {aporte !== state.aporteMensal && (
                  <p className="text-[10px] text-primary font-bold">
                    Atual na Home: {formatCurrency(state.aporteMensal)}/mês
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Aporte extra mensal (R$/mês)</Label>
                <Input 
                  type="number" 
                  value={aporteExtra || ''} 
                  onChange={(e) => setAporteExtra(e.target.value === '' ? 0 : Number(e.target.value))} 
                  className="rounded-xl py-6 bg-primary/5 border-primary/20" 
                  placeholder="Ex: 200" 
                />
              </div>
              
              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Rentabilidade anual (%)</Label>
                <Input 
                  type="number" 
                  value={taxa || ''} 
                  onChange={(e) => setTaxa(e.target.value === '' ? 0 : Number(e.target.value))} 
                  className="rounded-xl py-6 bg-background" 
                />
                {taxa !== state.taxaAnual && (
                  <p className="text-[10px] text-primary font-bold">
                    Atual na Home: {state.taxaAnual}% a.a.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4️⃣ RESULTADO DA SIMULAÇÃO */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Resumo do Novo Cenário</h3>
          <Card className="border-none bg-primary/10">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Capital necessário</span>
                <span className="font-bold">{formatCurrency(patrimonioNecessarioNovo)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Capital simulado</span>
                <span className="font-bold text-primary">{formatCurrency(patrimonioSim)}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-border/50">
                <span className="text-sm font-bold">Independência em</span>
                <span className="font-bold text-primary text-lg capitalize">{dataFormatadaNova}</span>
              </div>

              {/* Impacto de +R$200 */}
              {economiaComPlus200 > 0 && (
                <div className="pt-4 border-t border-border/50 bg-green-500/5 -mx-6 -mb-6 px-6 py-4 rounded-b-lg space-y-1">
                  <p className="text-xs text-green-600 font-bold">💡 Com +R$200 por mês</p>
                  <p className="text-sm text-green-600 font-bold">
                    você anteciparia sua liberdade em {Math.floor(economiaComPlus200 / 12)} anos
                  </p>
                </div>
              )}

              {/* Metodologia */}
              <div className="pt-4 border-t border-border/50 space-y-2">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-muted-foreground italic">
                    Simulação baseada em rendimento médio de {taxa}% ao ano com reinvestimento dos rendimentos.
                  </p>
                </div>
                <p className="text-[10px] text-muted-foreground italic">
                  Resultados podem variar conforme o mercado.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 5️⃣ BOTÃO APLICAR CENÁRIO */}
        {temMudancas && (
          <button
            onClick={handleAplicar}
            className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/30 transition-all"
          >
            <CheckCircle2 className="w-5 h-5" />
            Aplicar Cenário à Home
          </button>
        )}

        {!temMudancas && (
          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground">
              Ajuste os parâmetros acima para simular e depois aplique à Home.
            </p>
          </div>
        )}

        {/* 🟡 SIMULAÇÃO AVANÇADA - FUNDADOR */}
        {!isFounder && (
          <Card className="border border-yellow-500/30 bg-yellow-500/5">
            <CardContent className="p-4 space-y-2 text-center">
              <Lock className="w-6 h-6 text-yellow-600 mx-auto" />
              <p className="text-sm font-bold uppercase text-yellow-600">Simulações Avançadas</p>
              <p className="text-xs text-yellow-600/70">Disponível apenas para o plano Fundador</p>
            </CardContent>
          </Card>
        )}
        {isFounder && (
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Lock className="w-4 h-4 text-yellow-600" />
              Simulação Avançada
            </h3>

            <button onClick={handlePremiumFeature} className="w-full">
              <Card className="border border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10 transition-colors cursor-pointer">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-yellow-600">Comparar Cenários</span>
                    <Lock className="w-4 h-4 text-yellow-600" />
                  </div>
                  <p className="text-[10px] text-yellow-600/70">Veja lado a lado diferentes estratégias</p>
                </CardContent>
              </Card>
            </button>

            <button onClick={handlePremiumFeature} className="w-full">
              <Card className="border border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10 transition-colors cursor-pointer">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-yellow-600">Simular Aumento de Aportes</span>
                    <Lock className="w-4 h-4 text-yellow-600" />
                  </div>
                  <p className="text-[10px] text-yellow-600/70">Teste aumentos progressivos de investimento</p>
                </CardContent>
              </Card>
            </button>

            <button onClick={handlePremiumFeature} className="w-full">
              <Card className="border border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10 transition-colors cursor-pointer">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-yellow-600">Simular Reinvestimento</span>
                    <Lock className="w-4 h-4 text-yellow-600" />
                  </div>
                  <p className="text-[10px] text-yellow-600/70">Veja o impacto dos juros compostos</p>
                </CardContent>
              </Card>
            </button>

            <button onClick={handlePremiumFeature} className="w-full">
              <Card className="border border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10 transition-colors cursor-pointer">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-yellow-600">Simular Inflação</span>
                    <Lock className="w-4 h-4 text-yellow-600" />
                  </div>
                  <p className="text-[10px] text-yellow-600/70">Ajuste para inflação futura</p>
                </CardContent>
              </Card>
            </button>
          </div>
        )}
      </main>

      {/* Modal de Confirmação */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              Aplicar Cenário?
            </DialogTitle>
            <DialogDescription className="sr-only">Confirme se deseja aplicar este cenário à sua Home.</DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="bg-primary/5 rounded-xl p-4 space-y-2">
              <p className="text-xs text-muted-foreground">Seus parâmetros serão atualizados para:</p>
              <div className="space-y-1 text-sm font-bold">
                <p>Meta: {formatCurrency(meta)}/mês</p>
                <p>Patrimônio: {formatCurrency(patrimonioSim)}</p>
                <p>Aporte: {formatCurrency(aporte)}/mês</p>
                <p>Taxa: {taxa}% a.a.</p>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-3">
            <button
              onClick={() => setIsConfirmOpen(false)}
              className="flex-1 py-3 border border-border rounded-xl font-bold hover:bg-accent transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmar}
              className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all"
            >
              Confirmar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}