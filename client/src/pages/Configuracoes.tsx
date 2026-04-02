
import { useFinancial } from "@/state/FinancialContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ChevronLeft, 
  Download, 
  Trash2, 
  ShieldCheck, 
  Star,
  Wallet
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Configuracoes() {
  const { state, setNumeroLiberdade, setAporteMensal, setTaxaAnual, setPatrimonioAtual } = useFinancial();
  const totalInvestimentos = state.investimentos.reduce((acc, inv) => acc + inv.valor, 0);

  const handleReset = () => {
    if (confirm("Tem certeza que deseja apagar todos os dados? Esta ação não pode ser desfeita.")) {
      localStorage.clear();
      window.location.href = "/";
    }
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "yee_finance_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast.success("Backup exportado com sucesso!");
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <header className="p-6 flex items-center gap-4">
        <Link href="/app">
          <button className="p-2 hover:bg-accent rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
        </Link>
        <h1 className="text-xl font-bold">Configurações</h1>
      </header>

      <main className="px-6 space-y-8 max-w-md mx-auto">
        {/* Premium Banner */}
        <Link href="/premium">
          <Card className="border-2 border-primary bg-primary/5 cursor-pointer hover:scale-[1.01] transition-transform overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                <Star className="w-6 h-6 text-primary-foreground fill-primary-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-primary uppercase tracking-widest">Plano Fundador</p>
                <p className="text-xs text-muted-foreground">Garanta sua vaga por apenas R$ 9,90/mês</p>
              </div>
              <ChevronLeft className="w-5 h-5 text-primary rotate-180" />
            </CardContent>
          </Card>
        </Link>

        <div className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Parâmetros do Plano</h3>
          
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Meta de Renda (R$/mês)</Label>
              <Input 
                type="number" 
                value={state.numeroLiberdade} 
                onChange={(e) => setNumeroLiberdade(Number(e.target.value))}
                className="rounded-xl py-6 bg-accent/20 border-none" 
              />
            </div>
            
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Patrimônio Atual (R$)</Label>
              <Input 
                type="number" 
                value={state.patrimonioAtual || totalInvestimentos} 
                onChange={(e) => setPatrimonioAtual(Number(e.target.value))}
                className="rounded-xl py-6 bg-accent/20 border-none" 
              />
              {totalInvestimentos > 0 && (
                <p className="text-[10px] text-muted-foreground">
                  Soma dos investimentos cadastrados: R$ {totalInvestimentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Aporte mensal (R$/mês)</Label>
              <Input 
                type="number" 
                value={state.aporteMensal} 
                onChange={(e) => setAporteMensal(Number(e.target.value))}
                className="rounded-xl py-6 bg-accent/20 border-none" 
              />
            </div>
            
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Rentabilidade anual (%)</Label>
              <Input 
                type="number" 
                value={state.taxaAnual} 
                onChange={(e) => setTaxaAnual(Number(e.target.value))}
                className="rounded-xl py-6 bg-accent/20 border-none" 
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Dados e Segurança</h3>
          
          <div className="space-y-3">
            <button 
              onClick={handleExport}
              className="w-full p-4 bg-accent/30 hover:bg-accent/50 rounded-2xl flex items-center gap-4 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center">
                <Download className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">Exportar Backup</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Salvar dados em JSON</p>
              </div>
            </button>

            <button 
              onClick={handleReset}
              className="w-full p-4 bg-destructive/5 hover:bg-destructive/10 rounded-2xl flex items-center gap-4 transition-colors text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-destructive" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm text-destructive">Resetar Aplicativo</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Apagar tudo e recomeçar</p>
              </div>
            </button>
          </div>
        </div>

        <footer className="pt-12 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-medium">Seus dados são salvos localmente.</span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">Yee Finance v2.0.0</p>
        </footer>
      </main>
    </div>
  );
}
