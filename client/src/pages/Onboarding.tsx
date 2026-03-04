import { useState, useEffect } from "react";
import { useFinancial } from "@/state/FinancialContext";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRight,
  ChevronLeft,
  ShieldCheck,
  LogIn
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { calcularMesesParaIndependencia } from "@/lib/evyCalculations";
import { toast } from "sonner";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [location, setLocation] = useLocation();
  const { state, setNumeroLiberdade, setAporteMensal, setTaxaAnual, setPatrimonioAtual, adicionarInvestimento } = useFinancial();

  // Local state for inputs
  const [nome, setNome] = useState("");
  const [meta, setMeta] = useState(state.numeroLiberdade || 5000);
  const [patrimonio, setPatrimonio] = useState(state.patrimonioAtual || 0);
  const [aporte, setAporte] = useState(state.aporteMensal || 1000);
  const [taxa, setTaxa] = useState(state.taxaAnual || 8);

  const totalSteps = 6;
  const progress = (step / totalSteps) * 100;

  // 1. Verificar se o usuário está logado ANTES de começar
  useEffect(() => {
    async function checkAuthAndOnboarding() {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!currentSession) {
          // Se não estiver logado, manda para o login/auth
          toast.info("Por favor, crie sua conta ou faça login para começar seu plano.");
          setLocation("/auth");
          return;
        }

        setSession(currentSession);

        // 2. Se logado, verificar se já completou o onboarding
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", currentSession.user.id)
          .maybeSingle();

        if (profile?.onboarding_completed) {
          // Se já completou, pula direto para a home
          setLocation("/app");
          return;
        }
      } catch (err) {
        console.error("Erro na verificação inicial:", err);
      } finally {
        setLoading(false);
      }
    }

    checkAuthAndOnboarding();
  }, [setLocation]);

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Final step: Save and finish
      if (!session?.user) {
        toast.error("Sessão expirada. Por favor, faça login novamente.");
        setLocation("/auth");
        return;
      }

      setNumeroLiberdade(meta);
      setAporteMensal(aporte);
      setTaxaAnual(taxa);
      setPatrimonioAtual(patrimonio);

      // 💾 SALVAR TUDO NO SUPABASE (Usando upsert para garantir que o perfil seja criado ou atualizado)
      const { error } = await supabase
        .from("profiles")
        .upsert({ 
          id: session.user.id,
          onboarding_completed: true,
          name: nome || session.user.user_metadata?.full_name || "",
          monthly_income_goal: meta,
          current_patrimony: patrimonio,
          monthly_contribution: aporte,
          expected_return_rate: taxa
        });

      if (error) {
        console.error("Erro ao salvar dados:", error);
        toast.error("Erro ao salvar seus dados. Verifique se sua conta foi criada corretamente.");
        return;
      }

      // Add initial investment if any
      if (patrimonio > 0) {
        adicionarInvestimento({
          id: 'initial',
          nome: 'Capital Acumulado',
          valor: patrimonio,
          categoria: 'Outros',
          tipoRendimento: 'juros',
          taxaAnual: taxa,
          dataAporte: new Date().toISOString().split("T")[0],
        });
      }
      
      localStorage.setItem("evy_user_name", nome);
      toast.success("Plano configurado com sucesso!");
      
      setTimeout(() => {
        setLocation("/app");
      }, 500);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const taxaMensalPadrao = 0.006; 
  const patrimonioNecessario = meta / taxaMensalPadrao;
  const mesesRestantes = calcularMesesParaIndependencia(patrimonio, aporte, taxa / 100, patrimonioNecessario);
  const anos = Math.floor(mesesRestantes / 12);
  const meses = Math.floor(mesesRestantes % 12);
  const dataAlvo = new Date();
  dataAlvo.setMonth(dataAlvo.getMonth() + Math.floor(mesesRestantes));
  const dataFormatada = dataAlvo.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground font-bold text-2xl mx-auto shadow-lg shadow-primary/20">Y</div>
          <h1 className="text-2xl font-bold tracking-tight">Yee Finance</h1>
          <p className="text-sm text-muted-foreground">Seu plano para nunca mais depender de salário</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <span>Passo {step} de {totalSteps}</span>
            <span>{progress.toFixed(0)}%</span>
          </div>
          <Progress value={progress} className="h-1" />
        </div>

        <div className="min-h-[300px] flex flex-col justify-center">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Como você se chama?</h2>
                <p className="text-muted-foreground">Vamos personalizar seu plano de liberdade.</p>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-accent/50 border-none rounded-2xl py-6 px-6 text-lg font-bold focus:ring-2 ring-primary outline-none transition-all"
                  placeholder="Seu nome"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Qual sua meta de renda mensal?</h2>
                <p className="text-muted-foreground">Quanto você precisa receber por mês para viver com liberdade?</p>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">R$</span>
                  <input
                    type="number"
                    value={meta || ''}
                    onChange={(e) => setMeta(e.target.value === '' ? 0 : Number(e.target.value))}
                    min="0"
                    className="w-full bg-accent/50 border-none rounded-2xl py-6 pl-12 pr-6 text-3xl font-bold focus:ring-2 ring-primary outline-none transition-all"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Quanto você já acumulou?</h2>
                <p className="text-muted-foreground">Seu patrimônio atual em investimentos e poupança.</p>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">R$</span>
                  <input
                    type="number"
                    value={patrimonio || ''}
                    onChange={(e) => setPatrimonio(e.target.value === '' ? 0 : Number(e.target.value))}
                    min="0"
                    className="w-full bg-accent/50 border-none rounded-2xl py-6 pl-12 pr-6 text-3xl font-bold focus:ring-2 ring-primary outline-none transition-all"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Quanto você investe por mês?</h2>
                <p className="text-muted-foreground">Seu aporte mensal atual para acelerar sua liberdade.</p>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">R$</span>
                  <input
                    type="number"
                    value={aporte || ''}
                    onChange={(e) => setAporte(e.target.value === '' ? 0 : Number(e.target.value))}
                    min="0"
                    className="w-full bg-accent/50 border-none rounded-2xl py-6 pl-12 pr-6 text-3xl font-bold focus:ring-2 ring-primary outline-none transition-all"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Qual sua rentabilidade anual esperada?</h2>
                <p className="text-muted-foreground">Taxa média anual dos seus investimentos.</p>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="number"
                    value={taxa}
                    onChange={(e) => setTaxa(Number(e.target.value))}
                    className="w-full bg-accent/50 border-none rounded-2xl py-6 px-6 pr-12 text-3xl font-bold focus:ring-2 ring-primary outline-none transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">%</span>
                </div>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight">Plano Gerado!</h2>
                <p className="text-muted-foreground">Veja o impacto do seu planejamento:</p>
              </div>

              <Card className="border-none bg-accent/30 overflow-hidden">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Meta Mensal</span>
                    <span className="font-bold text-primary">{formatCurrency(meta)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Patrimônio Alvo</span>
                    <span className="font-bold">{formatCurrency(patrimonioNecessario)}</span>
                  </div>
                  <div className="pt-4 border-t border-border/50 text-center space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Independência em</p>
                    <p className="text-3xl font-bold text-primary">{dataFormatada}</p>
                    <p className="text-sm text-muted-foreground">({anos} anos e {meses} meses)</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-4">
          {step > 1 && (
            <button onClick={handleBack} className="flex-1 py-4 bg-accent text-accent-foreground rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-accent/80 transition-colors">
              Voltar
            </button>
          )}
          <button onClick={handleNext} className="flex-[2] py-4 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
            {step === totalSteps ? 'Ver meu painel' : 'Próximo'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}