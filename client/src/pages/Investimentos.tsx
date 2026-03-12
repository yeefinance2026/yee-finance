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
  Crown,
  Sparkles,
  DollarSign,
  AlertCircle
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
  const limiteInvestimentos = isFounder ? Infinity : LIMITE_FREE;

  // Form state
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("Ações");
  const [taxa, setTaxa] = useState(state.taxaAnual.toString());
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

  // 3️⃣ TAXA ANUAL
  const taxaAnualSegura = state.taxaAnual || 8;

  // 4️⃣ TAXA MENSAL PADRÃO (0.6% ao mês = 6% ao ano)
  const taxaMensalPadrao = 0.006;

  // 5️⃣ PATRIMÔNIO NECESSÁRIO (Alvo de Liberdade)
  // FÓRMULA DA HOME: metaMensal / taxaMensalPadrao
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
      
      // Calcula novo patrimônio
      const novoPatrimonio = patrimonioTotal + novoValor;

      // Adiciona o investimento
      await adicionarInvestimento({
        id: Math.random().toString(36).substring(2, 9),
        nome,
        valor: novoValor,
        categoria,
        taxaAnual: tipoAtivo === "juros" ? Number(taxa) : 0,
        tipoRendimento: tipoAtivo,
        dataAporte: dataAporte,
      });

      // Sincroniza patrimônio
      await updatePatrimonioSupabase(novoPatrimonio);

      toast.success(`✅ Investimento adicionado!\nPatrimônio: ${formatCurrency(novoPatrimonio)}`);

      // Limpa o formulário
      setNome("");
      setValor("");
      setCategoria("Ações");
      setTaxa(state.taxaAnual.toString());
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
            <h1 className="text-xl font-bold">Meus Ativos</h1>
            {isFounder && (
              <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold flex items-center gap-1 w-fit">
                <Crown className="w-2 h-2" /> PLANO FOUNDER
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
              Novo Ativo
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold tracking-tight">Novo Investimento</DialogTitle>
              <DialogDescription className="sr-only">Adicione um novo ativo à sua carteira.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Nome do Ativo</Label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: PETR4, MXRF11, CDB..." className="rounded-xl py-6" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Valor (R$)</Label>
                  <Input type="number" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" className="rounded-xl py-6" />
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
                      <SelectItem value="Renda Fixa">Renda Fixa</SelectItem>
                      <SelectItem value="Cripto">Cripto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Tipo de Rendimento</Label>
                <div className="grid grid-cols-2 gap-2 bg-muted p-1 rounded-xl">
                  <button onClick={() => setTipoAtivo("dividendo")} className={`py-2 text-xs font-bold rounded-lg transition-all ${tipoAtivo === "dividendo" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>Dividendos</button>
                  <button onClick={() => setTipoAtivo("juros")} className={`py-2 text-xs font-bold rounded-lg transition-all ${tipoAtivo === "juros" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>Juros (RF)</button>
                </div>
              </div>
              {tipoAtivo === "juros" && (
                <div className="grid gap-2 animate-in fade-in slide-in-from-top-2">
                  <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Taxa Anual (%)</Label>
                  <Input type="number" value={taxa} onChange={(e) => setTaxa(e.target.value)} className="rounded-xl py-6" />
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
        {!isFounder && totalAtivos >= LIMITE_FREE && (
          <Card className="border-none bg-primary/10 overflow-hidden relative border-l-4 border-l-primary">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-primary">Limite de Ativos Atingido</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Você atingiu o limite de {LIMITE_FREE} ativos do plano gratuito. Desbloqueie o acesso ilimitado agora.
                  </p>
                </div>
              </div>
              <Link href="/checkout">
                <button className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                  <Sparkles className="w-4 h-4" />
                  ✨ Desbloquear Fundador
                </button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* ========== NÚMERO DOMINANTE (Renda Passiva) ========== */}
        <Card className="border-none bg-card shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Número Dominante</p>
                <p className="text-2xl font-bold text-primary">{progressoRenda.toFixed(1)}%</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
            </div>
            
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Renda Passiva</p>
                <span className="text-primary font-bold text-xs">{formatCurrency(rendaPassivaAtual)}</span>
              </div>
              <Progress value={progressoRenda} className="h-2" />
              <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                <span>Atual: {formatCurrency(rendaPassivaAtual)}</span>
                <span>Meta: {formatCurrency(metaMensal)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ========== PATRIMÔNIO TOTAL (Sincronizado com Home) ========== */}
        <Card className="border-none bg-card shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Patrimônio Total</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(patrimonioTotal)}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <PieChart className="w-5 h-5 text-primary" />
              </div>
            </div>
            
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Meta de Liberdade</p>
                </div>
                <span className="text-primary font-bold text-xs">{progressoPatrimonio.toFixed(1)}%</span>
              </div>
              <Progress value={progressoPatrimonio} className="h-2" />
              <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                <span>Atual: {formatCurrency(patrimonioTotal)}</span>
                <span>Alvo: {formatCurrency(patrimonioNecessario)}</span>
              </div>
            </div>

            {/* Aviso de sincronização */}
            <div className="pt-3 border-t border-border/50 bg-blue-500/5 -mx-6 -mb-6 px-6 py-3 rounded-b-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-blue-600 font-medium">
                Sincronizado com a Home. Adicione investimentos para atualizar automaticamente.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ========== SUA CARTEIRA ========== */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Sua Carteira</h3>
            <p className="text-[10px] font-bold text-muted-foreground">
              {totalAtivos}/{isFounder ? "∞" : LIMITE_FREE} ativos ({isFounder ? "FOUNDER" : "FREE"})
            </p>
          </div>
          
          {state.investimentos.length === 0 ? (
            <Card className="border border-dashed border-border bg-muted/50">
              <CardContent className="p-8 text-center space-y-2">
                <p className="text-sm font-bold text-muted-foreground">Nenhum ativo adicionado</p>
                <p className="text-xs text-muted-foreground">Clique em "Novo Ativo" para começar</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {state.investimentos.map((inv) => (
                <Card key={inv.id} className="border border-border bg-card hover:bg-accent/10 transition-colors group">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${inv.tipoRendimento === 'juros' ? 'bg-primary/10' : 'bg-secondary/10'}`}>
                        {inv.tipoRendimento === 'juros' ? <TrendingUp className="w-5 h-5 text-primary" /> : <DollarSign className="w-5 h-5 text-secondary" />}
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
                        {inv.tipoRendimento === 'juros' && (
                          <p className="text-[10px] text-primary font-bold">{inv.taxaAnual}% a.a.</p>
                        )}
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
      </main>
    </div>
  );
}