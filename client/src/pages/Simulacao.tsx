
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
  AlertCircle
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
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function Simulacao() {
  const { state, setNumeroLiberdade, setAporteMensal, setTaxaAnual, setPatrimonioAtual } = useFinancial();
  
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
        {/* Comparação de cenários */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border border-border bg-card">
            <CardContent className="p-4 space-y-2">
              <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Cenário Atual</p>
              <p className="text-lg font-bold text-primary">{dataFormatadaAtual}</p>
              <p className="text-[10px] text-muted-foreground">{Math.floor(mesesAtual/12)}a {mesesAtual%12}m a partir de hoje</p>
            </CardContent>
          </Card>
          
          <Card className={`border ${diferencaMeses >= 0 ? 'border-primary/30 bg-primary/5' : 'border-destructive/30 bg-destructive/5'}`}>
            <CardContent className="p-4 space-y-2">
              <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Novo Cenário</p>
              <p className={`text-lg font-bold ${diferencaMeses >= 0 ? 'text-primary' : 'text-destructive'}`}>{dataFormatadaNova}</p>
              {diferencaMeses !== 0 && (
                <div className="flex items-center gap-1 text-[10px] font-bold">
                  {diferencaMeses > 0 ? (
                    <span className="text-primary">▲ Antecipa em {diferencaAnos > 0 ? `${diferencaAnos}a ` : ''}{diferencaMesesResto}m</span>
                  ) : (
                    <span className="text-destructive">▼ Atrasa em {diferencaAnos > 0 ? `${diferencaAnos}a ` : ''}{diferencaMesesResto}m</span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Parâmetros */}
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
                  value={meta} 
                  onChange={(e) => setMeta(Number(e.target.value))} 
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
                  value={patrimonioSim} 
                  onChange={(e) => setPatrimonioSim(Number(e.target.value))} 
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
                  value={aporte} 
                  onChange={(e) => setAporte(Number(e.target.value))} 
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
                  value={aporteExtra} 
                  onChange={(e) => setAporteExtra(Number(e.target.value))} 
                  className="rounded-xl py-6 bg-primary/5 border-primary/20" 
                  placeholder="Ex: 200" 
                />
              </div>
              
              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Rentabilidade anual (%)</Label>
                <Input 
                  type="number" 
                  value={taxa} 
                  onChange={(e) => setTaxa(Number(e.target.value))} 
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

        {/* Resumo do Novo Cenário */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Resumo do Novo Cenário</h3>
          <Card className="border border-border bg-card">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Capital necessário</span>
                <span className="font-bold">{formatCurrency(patrimonioNecessarioNovo)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Capital simulado</span>
                <span className="font-bold">{formatCurrency(patrimonioSim)}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-border/50">
                <span className="text-sm font-bold">Independência em</span>
                <span className="font-bold text-primary text-lg">{dataFormatadaNova}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botão de aplicar à Home */}
        {temMudancas && (
          <button
            onClick={handleAplicar}
            className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            Aplicar à Home
          </button>
        )}

        {!temMudancas && (
          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground">
              Ajuste os parâmetros acima para simular e depois aplique à Home.
            </p>
          </div>
        )}
      </main>

      {/* Modal de Confirmação */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              Confirmar alterações
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              As seguintes configurações serão aplicadas à tela Home:
            </p>
            <div className="space-y-2 bg-accent/30 rounded-xl p-4">
              {meta !== state.numeroLiberdade && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Meta de renda</span>
                  <span className="font-bold text-primary">{formatCurrency(meta)}/mês</span>
                </div>
              )}
              {patrimonioSim !== patrimonioBase && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Patrimônio atual</span>
                  <span className="font-bold text-primary">{formatCurrency(patrimonioSim)}</span>
                </div>
              )}
              {aporte !== state.aporteMensal && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Aporte mensal</span>
                  <span className="font-bold text-primary">{formatCurrency(aporte)}/mês</span>
                </div>
              )}
              {taxa !== state.taxaAnual && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rentabilidade</span>
                  <span className="font-bold text-primary">{taxa}% a.a.</span>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="gap-3">
            <button
              onClick={() => setIsConfirmOpen(false)}
              className="flex-1 py-3 border border-border rounded-2xl font-bold text-sm text-muted-foreground hover:bg-accent/30 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmar}
              className="flex-1 py-3 bg-primary text-primary-foreground rounded-2xl font-bold text-sm shadow-lg shadow-primary/20"
            >
              Confirmar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
