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
  BarChart2,
  Calendar,
  ChevronRight,
  Lock,
  Zap,
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

export default function Dividendos() {
  const { state, adicionarDividendo, removerDividendo } = useFinancial();
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  const [investimentoSelecionado, setInvestimentoSelecionado] = useState("");
  const [valorDividendo, setValorDividendo] = useState("");
  const [dataLancamento, setDataLancamento] = useState(new Date().toISOString().split('T')[0]);

  const [mesVisualizacao, setMesVisualizacao] = useState(new Date().toISOString().slice(0, 7));

  const investimentosDividendo = state.investimentos.filter(
    inv => inv.tipoRendimento === "dividendo" || !inv.tipoRendimento
  );

  const dividendos = state.dividendos || [];
  
  // --- LÓGICA DE RENDA MÉDIA MENSAL ---
  
  // 1. Juros Projetados para o mês selecionado
  const calcularRendaJurosNoMes = () => {
    const [anoVis, mesVis] = mesVisualizacao.split("-").map(Number);
    const dataAlvo = new Date(anoVis, mesVis - 1, 1);

    return state.investimentos
      .filter(inv => inv.tipoRendimento === "juros")
      .reduce((acc, inv) => {
        const dataAporte = new Date(inv.dataAporte + 'T00:00:00');
        const diffMeses = (dataAlvo.getFullYear() - dataAporte.getFullYear()) * 12 + (dataAlvo.getMonth() - dataAporte.getMonth());
        
        if (diffMeses < 0) return acc;

        const taxaMensal = (inv.taxaAnual / 100) / 12;
        let montanteAtual = inv.valor;
        for (let i = 0; i < diffMeses; i++) {
          montanteAtual += montanteAtual * taxaMensal;
        }
        
        const rendimentoDesteMes = montanteAtual * taxaMensal;
        return acc + Number(rendimentoDesteMes.toFixed(2));
      }, 0);
  };

  const rendaJurosMensal = Number(calcularRendaJurosNoMes().toFixed(2));

  // 2. Média de Dividendos dos últimos 12 meses
  const dataLimite12Meses = new Date();
  dataLimite12Meses.setFullYear(dataLimite12Meses.getFullYear() - 1);

  const dividendosUltimos12Meses = dividendos.filter(d => new Date(d.data) >= dataLimite12Meses);
  const totalDividendos12Meses = dividendosUltimos12Meses.reduce((acc, d) => acc + d.valor, 0);
  const mediaMensalDividendos = Number((totalDividendos12Meses / 12).toFixed(2));

  // 3. Renda Passiva Média Total
  const rendaPassivaMediaTotal = Number((rendaJurosMensal + mediaMensalDividendos).toFixed(2));
  const metaMensal = state.numeroLiberdade || 1000;
  
  // 4. Progresso rumo à Meta
  const progresso = Number(((rendaPassivaMediaTotal / metaMensal) * 100).toFixed(1));
  const faltaParaMeta = Number((metaMensal - rendaPassivaMediaTotal).toFixed(2));

  // 5. Dados do Mês Selecionado
  const totalDividendosMesSelecionado = Number(dividendos
    .filter(d => d.data.startsWith(mesVisualizacao))
    .reduce((acc, d) => acc + d.valor, 0).toFixed(2));

  // 6. Total de dividendos no ano
  const anoAtual = new Date().getFullYear().toString();
  const dividendosAnoAtual = dividendos.filter(d => d.data.startsWith(anoAtual));
  const totalDividendosAnoAtual = dividendosAnoAtual.reduce((acc, d) => acc + d.valor, 0);

  const formatarMesAno = (mesStr: string) => {
    const [ano, m] = mesStr.split("-");
    const data = new Date(Number(ano), Number(m) - 1, 1);
    const nomeMes = data.toLocaleDateString("pt-BR", { month: "long" });
    return `${nomeMes} de ${ano}`;
  };

  const formatarData = (dataStr: string) => {
    const data = new Date(dataStr + 'T00:00:00');
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleAdd = async () => {
    if (!investimentoSelecionado || !valorDividendo) return;
    const inv = state.investimentos.find(i => i.id === investimentoSelecionado);
    if (!inv) return;

    await adicionarDividendo({
      id: Math.random().toString(36).substring(2, 9),
      investimentoId: inv.id,
      investimentoNome: inv.nome,
      valor: Number(valorDividendo),
      mes: dataLancamento.slice(0, 7),
      data: dataLancamento,
    });

    setInvestimentoSelecionado("");
    setValorDividendo("");
    setIsAddOpen(false);
  };

  const handlePremiumFeature = () => {
    toast.info("Disponível no plano Fundador", {
      description: "Desbloqueie análises avançadas e projeções.",
    });
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
          <h1 className="text-xl font-bold">Dividendos</h1>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4" />
              Lançar
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold tracking-tight">Lançar Dividendo</DialogTitle>
              <DialogDescription className="sr-only">Preencha os campos para lançar o dividendo.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Ativo</Label>
                <Select value={investimentoSelecionado} onValueChange={setInvestimentoSelecionado}>
                  <SelectTrigger className="rounded-xl py-6">
                    <SelectValue placeholder="Selecione o ativo" />
                  </SelectTrigger>
                  <SelectContent>
                    {investimentosDividendo.map(inv => (
                      <SelectItem key={inv.id} value={inv.id}>{inv.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Valor Recebido (R$)</Label>
                <Input type="number" value={valorDividendo} onChange={(e) => setValorDividendo(e.target.value)} placeholder="Ex: 150,00" className="rounded-xl py-6" />
              </div>
              <div className="grid gap-2">
                <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Data do Recebimento</Label>
                <Input type="date" value={dataLancamento} onChange={(e) => setDataLancamento(e.target.value)} className="rounded-xl py-6" />
              </div>
            </div>
            <DialogFooter>
              <button onClick={handleAdd} className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg shadow-lg shadow-primary/20">Confirmar Lançamento</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <main className="px-6 space-y-6 max-w-md mx-auto">
        {/* SELETOR DE MÊS */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Calendar className="w-4 h-4 text-primary-foreground" />
          </div>
          <Input 
            type="month" 
            value={mesVisualizacao} 
            onChange={(e) => setMesVisualizacao(e.target.value)}
            className="w-full bg-primary text-primary-foreground font-bold rounded-2xl py-7 pl-12 pr-4 border-none shadow-lg shadow-primary/20 appearance-none cursor-pointer text-lg"
          />
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
            <ChevronRight className="w-5 h-5 text-primary-foreground/50" />
          </div>
        </div>

        {/* 🟢 FREE: RECEBIDO NO MÊS */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            {formatarMesAno(mesVisualizacao)}
          </h3>
          
          <Card className="border border-border bg-card">
            <CardContent className="p-6">
              <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2">Recebido no mês</p>
              <p className="text-4xl font-bold">{formatCurrency(totalDividendosMesSelecionado)}</p>
            </CardContent>
          </Card>
        </div>

        {/* 🟢 FREE: TOTAL NO ANO */}
        {totalDividendosAnoAtual > 0 && (
          <Card className="border-2 border-green-500/30 bg-green-500/5">
            <CardContent className="p-6 text-center space-y-2">
              <p className="text-xs font-bold uppercase text-green-600">Dividendos recebidos em {anoAtual}</p>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(totalDividendosAnoAtual)}</p>
            </CardContent>
          </Card>
        )}

        {/* 🟡 FUNDADOR: RENDA MÉDIA MENSAL */}
        <button onClick={handlePremiumFeature} className="w-full">
          <Card className="border border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10 transition-colors cursor-pointer">
            <CardContent className="p-6 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-yellow-600">Renda Média Mensal</p>
                <Lock className="w-4 h-4 text-yellow-600" />
              </div>
              <h2 className="text-4xl font-bold text-yellow-600">≈ {formatCurrency(rendaPassivaMediaTotal)}</h2>
              <p className="text-[10px] text-yellow-600/70 italic">
                Baseado nos dividendos e juros recebidos.
              </p>
            </CardContent>
          </Card>
        </button>

        {/* 🟡 FUNDADOR: COBERTURA DA LIBERDADE */}
        <button onClick={handlePremiumFeature} className="w-full">
          <Card className="border-none bg-yellow-500/5 overflow-hidden relative">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-yellow-600">Cobertura da Liberdade</p>
                <Lock className="w-4 h-4 text-yellow-600" />
              </div>

              <div className="space-y-1">
                <h2 className="text-5xl font-bold text-yellow-600">{progresso.toFixed(1)}%</h2>
                <p className="text-sm text-yellow-600/70">da sua meta de {formatCurrency(metaMensal)}</p>
              </div>
              
              <div className="space-y-2">
                <Progress value={progresso} className="h-2 bg-yellow-500/20" />
                <div className="flex justify-between text-xs font-bold text-yellow-600/70">
                  <span>{formatCurrency(rendaPassivaMediaTotal)}</span>
                  <span>{formatCurrency(metaMensal)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </button>

        {/* 🟡 FUNDADOR: ESTIMATIVA RENDA FIXA */}
        <button onClick={handlePremiumFeature} className="w-full">
          <Card className="border border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10 transition-colors cursor-pointer">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-yellow-600">Estimativa Renda Fixa</p>
                <Lock className="w-4 h-4 text-yellow-600" />
              </div>
              <p className="text-3xl font-bold text-yellow-600">≈ {formatCurrency(rendaJurosMensal)}</p>
              <p className="text-[10px] text-yellow-600/70">Valor estimado com base nos investimentos atuais.</p>
            </CardContent>
          </Card>
        </button>

        {/* 🟢 FREE: HISTÓRICO DE DIVIDENDOS */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Histórico de Dividendos</h3>
          
          {dividendos.length === 0 ? (
            <div className="text-center py-8 space-y-2 bg-accent/20 rounded-2xl">
              <BarChart2 className="w-8 h-8 text-muted-foreground mx-auto opacity-40" />
              <p className="text-sm text-muted-foreground">Nenhum dividendo lançado ainda.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {dividendos.sort((a, b) => b.data.localeCompare(a.data)).map(d => (
                <Card key={d.id} className="border border-border bg-card hover:bg-accent/10 transition-colors">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <BarChart2 className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm">{d.investimentoNome}</p>
                        <p className="text-[10px] text-muted-foreground">Dividendo recebido</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-bold text-sm text-primary">{formatCurrency(d.valor)}</p>
                        <p className="text-[10px] text-muted-foreground">{formatarData(d.data)}</p>
                      </div>
                      <button 
                        onClick={() => removerDividendo(d.id)} 
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all flex-shrink-0"
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