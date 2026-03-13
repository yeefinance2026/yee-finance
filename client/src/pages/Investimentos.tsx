import { useState } from "react";
import { useFinancial } from "@/state/FinancialContext";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import { Link } from "wouter";
import { 
  ChevronLeft, 
  Plus, 
  Trash2, 
  TrendingUp, 
  PieChart, 
  Target,
  Lock,
  Zap,
  Sparkles,
  DollarSign,
  AlertCircle,
  BarChart3
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";

type TipoRendimento = "dividendo" | "juros";

export default function Investimentos() {
  const { state, adicionarInvestimento, removerInvestimento, updatePatrimonioSupabase } = useFinancial();
  const [isAddOpen, setIsAddOpen] = useState(false);

  // --- LÓGICA DE PLANO E LIMITES ---
  const planoTipo = state.profile?.plan || "free";
  const isFounder = planoTipo === "founder";
  const LIMITE_FREE = 5;

  // Form state
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState<string>("");
  const [categoria, setCategoria] = useState("Ações");
  const [taxa, setTaxa] = useState<string>("");
  const [tipoAtivo, setTipoAtivo] = useState<TipoRendimento>("dividendo");
  const [dataAporte, setDataAporte] = useState(new Date().toISOString().split('T')[0]);

  const totalAtivos = state.investimentos.length;
  const botaoAddDisabled = !isFounder && totalAtivos >= LIMITE_FREE;

  // ========== SINCRONIZAÇÃO COMPLETA COM HOME ==========
  
  // 1️⃣ PATRIMÔNIO TOTAL (Sincronizado)
  const patrimonioTotal = (state.patrimonioAtual && state.patrimonioAtual > 0)
    ? state.patrimonioAtual
    : state.investimentos.reduce((acc, inv) => acc + inv.valor, 0);

  // 2️⃣ META MENSAL (Número Dominante)
  const metaMensal = state.numeroLiberdade || 1;

  // 4️⃣ TAXA MENSAL PADRÃO (0.6% ao mês = 6% ao ano)
  const taxaMensalPadrao = 0.006;

  // 5️⃣ PATRIMÔNIO NECESSÁRIO (Alvo de Liberdade)
  const patrimonioNecessario = metaMensal > 0 ? metaMensal / taxaMensalPadrao : 0;

  // 6️⃣ PROGRESSO DO PATRIMÔNIO (%)
  const progressoPatrimonio = patrimonioNecessario > 0 
    ? Math.min(100, (patrimonioTotal / patrimonioNecessario) * 100) 
    : 0;

  // 7️⃣ RENDA DE JUROS (Investimentos com taxa)
  const rendaJuros = state.investimentos
    .filter(inv => inv.tipoRendimento === "juros")
    .reduce((acc, inv) => acc + (inv.valor * (inv.taxaAnual / 100)) / 12, 0);

  // 8️⃣ DIVIDENDOS DO MÊS ATUAL
  const mesAtual = new Date().toISOString().slice(0, 7);
  const dividendosMesAtual = (state.dividendos || []).filter(d => d.mes === mesAtual);
  const totalDividendosMes = dividendosMesAtual.reduce((acc, d) => acc + d.valor, 0);

  // 9️⃣ RENDA PASSIVA TOTAL
  const rendaPassivaAtual = rendaJuros + totalDividendosMes;

  // 🔟 PROGRESSO DE RENDA (Número Dominante)
  const progressoRenda = metaMensal > 0 
    ? Math.min(100, (rendaPassivaAtual / metaMensal) * 100) 
    : 0;

  const handleAdd = async () => {
    if (!nome || !valor) {
      toast.error("Preencha todos os campos");
      return;
    }
    if (!isFounder && totalAtivos >= LIMITE_FREE) {
      toast.error("Limite de ativos atingido");
      return;
    }

    try {
      const novoValor = Number(valor);
      const novoPatrimonio = patrimonioTotal + novoValor;

      await adicionarInvestimento({
        id: Math.random().toString(36).substring(2, 9),
        nome,
        valor: novoValor,
        categoria,
        taxaAnual: tipoAtivo === "juros" ? Number(taxa || 0) : 0,
        tipoRendimento: tipoAtivo,
        dataAporte: dataAporte,
      });

      await updatePatrimonioSupabase(novoPatrimonio);

      toast.success(`✅ Investimento adicionado!\nPatrimônio: ${formatCurrency(novoPatrimonio)}`);

      // Limpa o formulário
      setNome("");
      setValor("");
      setCategoria("Ações");
      setTaxa("");
      setTipoAtivo("dividendo");
      setDataAporte(new Date().toISOString().split('T')[0]);
      setIsAddOpen(false);
    } catch (err) {
      console.error("Erro ao adicionar investimento:", err);
      toast.error("Erro ao adicionar investimento");
    }
  };

  const handleRemover = async (id: string) => {
    try {
      const investimentoRemovido = state.investimentos.find(inv => inv.id === id);
      if (!investimentoRemovido) return;

      const novoPatrimonio = patrimonioTotal - investimentoRemovido.valor;

      await removerInvestimento(id);
      await updatePatrimonioSupabase(novoPatrimonio);

      toast.success(`✅ Investimento removido!\nPatrimônio: ${formatCurrency(novoPatrimonio)}`);
    } catch (err) {
      console.error("Erro ao remover investimento:", err);
      toast.error("Erro ao remover investimento");
    }
  };

  const handlePremiumFeature = () => {
    if (isFounder) return;
    toast.info("Disponível no plano Fundador", {
      description: "Desbloqueie análises avançadas e projeções.",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* 1️⃣ Header */}
      <header className="p-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/app">
            <button className="p-2 hover:bg-accent rounded-full transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold">Investimentos</h1>
            {isFounder && (
              <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold flex items-center gap-1 w-fit">
                <Zap className="w-2 h-2" /> PLANO FUNDADOR
              </span>
            )}
          </div>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <button 
              disabled={botaoAddDisabled}
              className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg transition-all ${
                botaoAddDisabled 
                ? "bg-muted text-muted-foreground cursor-not-allowed" 
                : "bg-primary text-primary-foreground shadow-primary/20 hover:scale-105"
              }`}
            >
              {botaoAddDisabled ? <Lock className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              Adicionar
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold tracking-tight">Novo Investimento</DialogTitle>
              <DialogDescription className="sr-only">Adicione um novo ativo à sua carteira.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Tipo de Rendimento</Label>
                <div className="grid grid-cols-2 gap-2 bg-muted p-1 rounded-xl">
                  <button onClick={() => setTipoAtivo("dividendo")} className={`py-2 text-xs font-bold rounded-lg transition-all ${tipoAtivo === "dividendo" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>Dividendo</button>
                  <button onClick={() => setTipoAtivo("juros")} className={`py-2 text-xs font-bold rounded-lg transition-all ${tipoAtivo === "juros" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>Juros</button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Nome do Ativo</Label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: PETR4, MXRF11, CDB..." className="rounded-xl py-6" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Valor Investido (R$)</Label>
                  <Input 
                    type="number" 
                    value={valor} 
                    onChange={(e) => setValor(e.target.value)} 
                    placeholder="Ex: 5000" 
                    className="rounded-xl py-6" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Categoria</Label>
                  <Select value={categoria} onValueChange={setCategoria}>
                    <SelectTrigger className="rounded-xl py-6">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ações">Ações</SelectItem>
                      <SelectItem value="FIIs">FIIs</SelectItem>
                      <SelectItem value="ETFs">ETFs</SelectItem>
                      <SelectItem value="BDRs">BDRs</SelectItem>
                      <SelectItem value="CDB">CDB</SelectItem>
                      <SelectItem value="Tesouro Direto">Tesouro Direto</SelectItem>
                      <SelectItem value="LCI/LCA">LCI/LCA</SelectItem>
                      <SelectItem value="Debêntures">Debêntures</SelectItem>
                      <SelectItem value="Cripto">Cripto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {tipoAtivo === "juros" && (
                <div className="grid gap-2 animate-in fade-in slide-in-from-top-2">
                  <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Taxa Anual (%)</Label>
                  <Input 
                    type="number" 
                    value={taxa} 
                    onChange={(e) => setTaxa(e.target.value)} 
                    placeholder="Ex: 8" 
                    className="rounded-xl py-6" 
                  />
                </div>
              )}
              <div className="grid gap-2">
                <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Data do Aporte</Label>
                <Input type="date" value={dataAporte} onChange={(e) => setDataAporte(e.target.value)} className="rounded-xl py-6" />
              </div>
            </div>
            <DialogFooter>
              <button onClick={handleAdd} className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg shadow-lg shadow-primary/20">Salvar Investimento</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <main className="px-6 space-y-8 max-w-md mx-auto">
        {/* 2️⃣ Capital acumulado (FREE) */}
        <Card className="border-none bg-card shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Capital Acumulado</p>
                <p className="text-3xl font-bold text-primary">{formatCurrency(patrimonioTotal)}</p>
                <p className="text-[10px] font-bold text-muted-foreground">
                  {totalAtivos}/{isFounder ? "∞" : LIMITE_FREE} ativos ({isFounder ? "FUNDADOR" : "FREE"})
                </p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <PieChart className="w-5 h-5 text-primary" />
              </div>
            </div>
            
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Progresso da Meta</p>
                </div>
                <span className="text-primary font-bold text-xs">{progressoPatrimonio.toFixed(1)}%</span>
              </div>
              <Progress value={progressoPatrimonio} className="h-2" />
              <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                <span>Atual: {formatCurrency(patrimonioTotal)}</span>
                <span>Alvo: {formatCurrency(patrimonioNecessario)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3️⃣ Aviso de limite FREE */}
        {!isFounder && totalAtivos >= LIMITE_FREE && (
          <Card className="border-none bg-primary/10 overflow-hidden relative border-l-4 border-l-primary">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-primary">Limite de investimentos atingido</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Upgrade para Fundador para adicionar mais ativos à sua carteira.
                  </p>
                </div>
              </div>
              <Link href="/checkout">
                <button className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                  <Zap className="w-4 h-4" />
                  ✨ Desbloquear Fundador
                </button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* 4️⃣ Renda passiva estimada (FREE) */}
        <Card className="border-none bg-card shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Renda Passiva Estimada</p>
                <p className="text-2xl font-bold text-primary">≈ {formatCurrency(rendaPassivaAtual)}/mês</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 5️⃣ & 6️⃣ SUA CARTEIRA (Renda Variável e Fixa) */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Sua Carteira</h3>
          
          {state.investimentos.length === 0 ? (
            <Card className="border border-dashed border-border bg-muted/50">
              <CardContent className="p-8 text-center space-y-2">
                <p className="text-sm font-bold text-muted-foreground">Nenhum ativo adicionado</p>
                <p className="text-xs text-muted-foreground">Clique em "Adicionar" para começar</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Renda Variável */}
              {state.investimentos.filter(inv => inv.tipoRendimento === "dividendo").length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Renda Variável</p>
                  {state.investimentos.filter(inv => inv.tipoRendimento === "dividendo").map((inv) => (
                    <Card key={inv.id} className="border border-border bg-card hover:bg-accent/10 transition-colors group">
                      <CardContent className="p-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-secondary" />
                          </div>
                          <div>
                            <p className="font-bold text-sm">{inv.nome}</p>
                            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">{inv.categoria}</p>
                            <p className="text-[10px] text-muted-foreground">{new Date(inv.dataAporte + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-bold text-sm">{formatCurrency(inv.valor)}</p>
                          </div>
                          <button 
                            onClick={() => handleRemover(inv.id)}
                            className="p-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Renda Fixa */}
              {state.investimentos.filter(inv => inv.tipoRendimento === "juros").length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Renda Fixa</p>
                  {state.investimentos.filter(inv => inv.tipoRendimento === "juros").map((inv) => (
                    <Card key={inv.id} className="border border-border bg-card hover:bg-accent/10 transition-colors group">
                      <CardContent className="p-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-bold text-sm">{inv.nome}</p>
                            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">{inv.categoria}</p>
                            <p className="text-[10px] text-muted-foreground">{new Date(inv.dataAporte + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-bold text-sm">{formatCurrency(inv.valor)}</p>
                            <p className="text-[10px] text-primary font-bold">{inv.taxaAnual}% a.a.</p>
                            <p className="text-[10px] text-muted-foreground">≈ {formatCurrency((inv.valor * (inv.taxaAnual / 100)) / 12)}/mês</p>
                          </div>
                          <button 
                            onClick={() => handleRemover(inv.id)}
                            className="p-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 7️⃣ Análises avançadas (Premium) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              {!isFounder && <Lock className="w-3 h-3" />}
              Análises Avançadas
            </h3>
            {!isFounder && (
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Premium</span>
            )}
          </div>

          <div className={`space-y-4 ${!isFounder && "blur-sm select-none opacity-50"}`} onClick={handlePremiumFeature}>
            <Card className="border border-border bg-card">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <PieChart className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Diversificação da Carteira</p>
                    <p className="text-xs text-muted-foreground">Renda Variável vs Renda Fixa</p>
                  </div>
                </div>
                <ChevronLeft className="w-5 h-5 text-muted-foreground rotate-180" />
              </CardContent>
            </Card>

            <Card className="border border-border bg-card">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Evolução do Patrimônio</p>
                    <p className="text-xs text-muted-foreground">Gráfico de crescimento mensal</p>
                  </div>
                </div>
                <ChevronLeft className="w-5 h-5 text-muted-foreground rotate-180" />
              </CardContent>
            </Card>

            <Card className="border border-border bg-card">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Projeção de Renda Futura</p>
                    <p className="text-xs text-muted-foreground">Simule seu crescimento em 5 anos</p>
                  </div>
                </div>
                <ChevronLeft className="w-5 h-5 text-muted-foreground rotate-180" />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}