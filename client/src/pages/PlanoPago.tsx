
import { Link } from "wouter";
import { ChevronLeft, ShieldCheck, Zap, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function PlanoPago() {
  return (
    <div className="min-h-screen bg-background pb-12">
      <header className="p-6 flex items-center gap-4">
        <Link href="/configuracoes">
          <button className="p-2 hover:bg-accent rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
        </Link>
        <h1 className="text-xl font-bold">Seja Fundador</h1>
      </header>

      <main className="px-6 space-y-8 max-w-md mx-auto">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600 text-[10px] font-bold uppercase tracking-widest">
            <Star className="w-3 h-3 fill-yellow-600" />
            Oportunidade Única
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Vagas Limitadas</h2>
          <p className="text-muted-foreground">
            O Yee Finance está crescendo e você pode fazer parte da história como um dos 100 primeiros fundadores.
          </p>
        </div>

        <Card className="border-2 border-primary bg-primary/5 overflow-hidden">
          <div className="bg-primary text-primary-foreground py-2 text-center text-[10px] font-bold uppercase tracking-widest">
            Escassez Real: 87/100 vagas preenchidas
          </div>
          <CardContent className="p-8 text-center space-y-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Plano Fundador</h3>
              <div className="flex items-center justify-center gap-1">
                <span className="text-muted-foreground line-through text-sm">R$ 29,90</span>
                <span className="text-4xl font-bold text-primary">R$ 9,90</span>
                <span className="text-muted-foreground text-sm">/mês</span>
              </div>
              <p className="text-xs text-muted-foreground">Preço travado para sempre enquanto durar a assinatura.</p>
            </div>

            <ul className="text-left space-y-4 text-sm font-medium">
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                </div>
                <span>Backup automático na nuvem</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <span>Simulador de cenários avançado</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Star className="w-4 h-4 text-primary" />
                </div>
                <span>Selo de Fundador no perfil</span>
              </li>
            </ul>

            <button className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
              Assinar Agora
            </button>
            
            <p className="text-[10px] text-muted-foreground">
              Pagamento seguro via Stripe. Cancele quando quiser.
            </p>
          </CardContent>
        </Card>

        <div className="p-6 bg-accent/20 rounded-2xl border border-border/50 text-center">
          <p className="text-sm font-medium italic">
            "O Yee Finance mudou minha forma de ver o dinheiro. Agora eu não invisto apenas, eu compro tempo de liberdade."
          </p>
          <p className="text-xs text-muted-foreground mt-2">— Usuário Fundador #12</p>
        </div>
      </main>
    </div>
  );
}
