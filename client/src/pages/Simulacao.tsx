import { useState, useMemo } from "react";
import { useFinancial } from "@/state/FinancialContext";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import { Link } from "wouter";
import { 
  ChevronLeft, 
  TrendingUp, 
  Calendar, 
  Target,
  Sparkles,
  Lock,
  Crown,
  Info,
  ArrowRight
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Simulador() {
  const { state } = useFinancial();
  
  // --- LÓGICA DE PLANO ---
  const planoTipo = state.profile?.plan || "free";
  const isFounder = planoTipo === "founder";
  
  // Limites de Simulação
  const MAX_ANOS_FREE = 10;
  const MAX_ANOS_FOUNDER = 50;
  const limiteAnos = isFounder ? MAX_ANOS_FOUNDER : MAX_ANOS_FREE;

  // Estados da Simulação
  const [anos, setAnos] = useState(10);
  const [aporteMensal, setAporteMensal] = useState(state.aporteMensal || 500);
  const [taxaAnual, setTaxaAnual] = useState(state.taxaAnual || 10);

  // Cálculo da Projeção
  const projecao = useMemo(() => {
    const meses = anos * 12;
    const taxaMensal = (taxaAnual / 100) / 12;
    let montante = state.investimentos.reduce((acc, inv) => acc + inv.valor, 0);
    
    const dadosGrafico = [];
    
    for (let i = 1; i <= meses; i++) {
      montante = (montante + aporteMensal) * (1 + taxaMensal);
      if (i % 12 === 0) {
        dadosGrafico.push({
          ano: i / 12,
          valor: montante
        });
      }
    }
    
    return {
      total: montante,
      apenasJuros: montante - (state.investimentos.reduce((acc, inv) => acc + inv.valor, 0) + (aporteMensal * meses)),
      historico: dadosGrafico
    };
  }, [anos, aporteMensal, taxaAnual, state.investimentos]);

  const rendaMensalProjetada = (projecao.total * (taxaAnual / 100)) / 12;
  const coberturaMeta = (rendaMensalProjetada / state.numeroLiberdade) * 100;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="p-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/app">
            <button className="p-2 hover:bg-accent rounded-full transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold">Simulador</h1>
            {isFounder && (
              <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold flex items-center gap-1 w-fit">
                <Crown className="w-2 h-2" /> PLANO FOUNDER
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="px-6 space-y-8 max-w-md mx-auto">
        {/* CARD DE RESULTADO PRINCIPAL */}
        <Card className="border-none bg-primary text-primary-foreground shadow-lg shadow-primary/20 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <TrendingUp className="w-32 h-32" />
          </div>
          <CardContent className="p-8 space-y-6 relative z-10">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Patrimônio em {anos} anos</p>
              <h2 className="text-5xl font-bold tracking-tighter">{formatCurrency(projecao.total)}</h2>
              <p className="text-sm font-medium opacity-90 flex items-center gap-1">
                Gerando {formatCurrency(rendaMensalProjetada)} / mês de renda passiva
              </p>
            </div>
            
            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Cobertura da Meta</p>
                <span className="font-bold text-sm">{coberturaMeta.toFixed(1)}%</span>
              </div>
              <Progress value={coberturaMeta} className="h-2 bg-white/20" />
            </div>
          </CardContent>
        </Card>

        {/* CONTROLES DA SIMULAÇÃO */}
        <div className="space-y-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Tempo: {anos} anos</Label>
                {!isFounder && anos >= MAX_ANOS_FREE && (
                  <span className="text-[10px] text-primary font-bold flex items-center gap-1">
                    <Lock className="w-2 h-2" /> LIMITE FREE
                  </span>
                )}
              </div>
              <Slider 
                value={[anos]} 
                onValueChange={(v) => setAnos(v[0])} 
                max={limiteAnos} 
                min={1} 
                step={1}
                className="py-4"
              />
            </div>

            <div className="space-y-4">
              <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Aporte Mensal: {formatCurrency(aporteMensal)}</Label>
              <Slider 
                value={[aporteMensal]} 
                onValueChange={(v) => setAporteMensal(v[0])} 
                max={10000} 
                min={100} 
                step={100}
                className="py-4"
              />
            </div>

            <div className="space-y-4">
              <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Taxa Anual Esperada: {taxaAnual}%</Label>
              <Slider 
                value={[taxaAnual]} 
                onValueChange={(v) => setTaxaAnual(v[0])} 
                max={20} 
                min={1} 
                step={0.5}
                className="py-4"
              />
            </div>
          </div>
        </div>

        {/* BANNER DE UPGRADE - SÓ PARA FREE */}
        {!isFounder && (
          <Card className="border-none bg-primary/10 border-l-4 border-l-primary overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-primary">Simulação Ilimitada</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Como Founder, você pode simular até **50 anos** e ver o real impacto dos juros compostos na sua vida.
                  </p>
                </div>
              </div>
              <Link href="/checkout">
                <button className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                  ✨ Desbloquear Simulação Completa
                </button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* DETALHES TÉCNICOS */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Resumo da Projeção</h3>
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-card border-none shadow-sm">
              <CardContent className="p-4">
                <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Total em Juros</p>
                <p className="text-xl font-bold text-primary">{formatCurrency(projecao.apenasJuros)}</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-none shadow-sm">
              <CardContent className="p-4">
                <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Renda Futura</p>
                <p className="text-xl font-bold text-primary">{formatCurrency(rendaMensalProjetada)}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
