import { useState } from "react";
import { useFinancial } from "@/state/FinancialContext";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  ChevronLeft,
  Wallet,
  Trash2,
  Landmark,
  BarChart2,
} from "lucide-react";
import { Link } from "wouter";
import { formatCurrency } from "@/lib/utils";
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
import { TipoRendimento } from "@/state/financial.types";

const CATEGORIAS_JUROS = ["CDB", "Tesouro Direto", "LCI/LCA", "Debêntures", "Poupança", "Outros RF"];
const CATEGORIAS_DIVIDENDO = ["Ações", "FIIs", "ETFs", "BDRs", "Outros RV"];

export default function Investimentos() {
  const {
    state,
    adicionarInvestimento,
    removerInvestimento,
  } = useFinancial();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [tipoAtivo, setTipoAtivo] = useState<TipoRendimento>("dividendo");

  // Form state
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("Ações");
  const [taxa, setTaxa] = useState(state.taxaAnual.toString());
  const [dataAporte, setDataAporte] = useState(
    new Date().toISOString().split("T")[0]
  );

  const totalInvestido = state.investimentos.reduce((acc, inv) => acc + inv.valor, 0);
  const metaMensal = state.numeroLiberdade;

  const investimentosJuros = state.investimentos.filter(inv => inv.tipoRendimento === "juros");
  const rendaJuros = investimentosJuros.reduce((acc, inv) => acc + (inv.valor * (inv.taxaAnual / 100)) / 12, 0);

  const mesAtual = new Date().toISOString().slice(0, 7);
  const dividendosMesAtual = (state.dividendos || []).filter(d => d.mes === mesAtual);
  const totalDividendosMes = dividendosMesAtual.reduce((acc, d) => acc + d.valor, 0);

  const rendaPassivaTotal = rendaJuros + totalDividendosMes;
  const progresso = metaMensal > 0 ? Math.min(100, (rendaPassivaTotal / metaMensal) * 100) : 0;

  const handleTipoChange = (tipo: TipoRendimento) => {
    setTipoAtivo(tipo);
    if (tipo === "juros") {
      setCategoria("CDB");
    } else {
      setCategoria("Ações");
    }
  };

  const handleAdd = async () => {
    if (!nome || !valor) return;

    await adicionarInvestimento({
      id: Math.random().toString(36).substr(2, 9), // Adicionado ID tempor favorável
      nome,
      valor: Number(valor),
      categoria,
      taxaAnual: tipoAtivo === "juros" ? Number(taxa) : 0,
      tipoRendimento: tipoAtivo,
      dataAporte: dataAporte,
    });

    setNome("");
    setValor("");
    setTaxa(state.taxaAnual.toString());
    setIsAddOpen(false);
  };


  const handleDelete = (id: string) => {
    removerInvestimento(id);
  };

  const investimentosJurosList = state.investimentos.filter(inv => inv.tipoRendimento === "juros");
  const investimentosDividendoList = state.investimentos.filter(inv => inv.tipoRendimento === "dividendo" || !inv.tipoRendimento);

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="p-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/app">
            <button className="p-2 hover:bg-accent rounded-full transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
          </Link>
          <h1 className="text-xl font-bold">Aportes</h1>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold tracking-tight">Novo Investimento</DialogTitle>
              <DialogDescription>Preencha os campos para adicionar um novo investimento</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Tipo de Rendimento</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleTipoChange("dividendo")}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all font-bold text-sm ${tipoAtivo === "dividendo"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground"
                      }`}
                  >
                    <BarChart2 className="w-4 h-4" />
                    Dividendo
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTipoChange("juros")}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all font-bold text-sm ${tipoAtivo === "juros"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground"
                      }`}
                  >
                    <Landmark className="w-4 h-4" />
                    Juros
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {tipoAtivo === "dividendo"
                    ? "Ações, FIIs, ETFs — dividendos lançados manualmente"
                    : "CDB, Tesouro, LCI — renda calculada pela taxa anual"}
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="nome" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Nome do Ativo</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder={tipoAtivo === "dividendo" ? "Ex: PETR4, MXRF11..." : "Ex: CDB Banco XP, Tesouro Selic..."}
                  className="rounded-xl py-6"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="valor" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Valor Investido (R$)</Label>
                <Input id="valor" type="number" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="Ex: 5000" className="rounded-xl py-6" />
              </div>
              <div className="grid gap-2">
                <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
                  Data do Aporte
                </Label>
                <Input
                  type="date"
                  value={dataAporte}
                  onChange={(e) => setDataAporte(e.target.value)}
                  className="rounded-xl py-6"
                />
              </div>
              <div className={`grid gap-4 ${tipoAtivo === "juros" ? "grid-cols-2" : "grid-cols-1"}`}>
                <div className="grid gap-2">
                  <Label htmlFor="categoria" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Categoria</Label>
                  <Select value={categoria} onValueChange={setCategoria}>
                    <SelectTrigger className="rounded-xl py-6">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {(tipoAtivo === "juros" ? CATEGORIAS_JUROS : CATEGORIAS_DIVIDENDO).map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {tipoAtivo === "juros" && (
                  <div className="grid gap-2">
                    <Label htmlFor="taxa" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Rentabilidade (% a.a.)</Label>
                    <Input id="taxa" type="number" value={taxa} onChange={(e) => setTaxa(e.target.value)} className="rounded-xl py-6" />
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <button onClick={handleAdd} className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg shadow-lg shadow-primary/20">
                Salvar Investimento
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <main className="px-6 space-y-8 max-w-md mx-auto">
        <Card className="border-none bg-primary/10">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Wallet className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Capital Acumulado</span>
            </div>
            <div className="space-y-1">
              <h2 className="text-4xl font-bold tracking-tight text-foreground">{formatCurrency(totalInvestido)}</h2>
              <p className="text-sm text-muted-foreground font-medium">
                {progresso.toFixed(1)}% da meta de liberdade
              </p>
            </div>
            <Progress value={progresso} className="h-2" />
            <div className="pt-2 border-t border-border/50">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Renda Passiva Consolidada (Mês)</p>
              <p className="text-sm font-bold text-primary">{formatCurrency(rendaPassivaTotal)}/mês</p>
            </div>
          </CardContent>
        </Card>

        {/* Seção: Renda Variável (Dividendos) */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Renda Variável</h3>
            </div>
            <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded-lg">{investimentosDividendoList.length} ativos</span>
          </div>
          <p className="text-[10px] text-muted-foreground -mt-2">Ações, FIIs, ETFs — dividendos lançados manualmente</p>

          <div className="space-y-3">
            {investimentosDividendoList.map((inv) => (
              <Card key={inv.id} className="border border-border bg-card hover:bg-accent/20 transition-colors group">
                <CardContent className="p-4 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <BarChart2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{inv.nome}</p>
                      <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">{inv.categoria}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(inv.dataAporte + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className="font-bold text-sm">{formatCurrency(inv.valor)}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(inv.id)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {investimentosDividendoList.length === 0 && (
              <div className="text-center py-8 space-y-2 bg-accent/20 rounded-2xl">
                <BarChart2 className="w-8 h-8 text-muted-foreground mx-auto opacity-40" />
                <p className="text-sm text-muted-foreground">Nenhum ativo de renda variável.</p>
              </div>
            )}
          </div>
        </div>

        {/* Seção: Renda Fixa (Juros) */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Landmark className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Renda Fixa</h3>
            </div>
            <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded-lg">{investimentosJurosList.length} ativos</span>
          </div>
          <p className="text-[10px] text-muted-foreground -mt-2">CDB, Tesouro, LCI — renda calculada pela taxa anual</p>

          <div className="space-y-3">
            {investimentosJurosList.map((inv) => (
              <Card key={inv.id} className="border border-border bg-card hover:bg-accent/20 transition-colors group">
                <CardContent className="p-4 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Landmark className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{inv.nome}</p>
                      <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">{inv.categoria}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(inv.dataAporte + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className="font-bold text-sm">{formatCurrency(inv.valor)}</p>
                      <p className="text-[10px] font-bold text-primary">{inv.taxaAnual}% a.a.</p>
                      <p className="text-[10px] text-muted-foreground">{formatCurrency((inv.valor * (inv.taxaAnual / 100)) / 12)}/mês</p>
                    </div>
                    <button
                      onClick={() => handleDelete(inv.id)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {investimentosJurosList.length === 0 && (
              <div className="text-center py-8 space-y-2 bg-accent/20 rounded-2xl">
                <Landmark className="w-8 h-8 text-muted-foreground mx-auto opacity-40" />
                <p className="text-sm text-muted-foreground">Nenhum ativo de renda fixa.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
