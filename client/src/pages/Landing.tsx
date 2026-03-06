
import { Link } from "wouter";
import { ArrowRight, Zap, TrendingUp, Calendar, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Hero Section */}
      <header className="px-6 pt-16 pb-12 text-center space-y-6 max-w-md mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
          <Zap className="w-3 h-3 fill-primary" />
          Yee Finance v1.0
        </div>
        <h1 className="text-5xl font-bold tracking-tighter leading-tight">
          Seu plano para viver de renda começa aqui.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Descubra quanto patrimônio você precisa,
          quanto tempo falta para sua independência
          e como acelerar sua liberdade financeira.
          <br />
          <span className="font-semibold">Simples. Direto. Estratégico.</span>
        </p>
        <div className="pt-4">
          <Link href="/onboarding">
            <button className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform">
              Começar meu plano de liberdade
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
        <p className="text-xs text-muted-foreground">
          Ferramenta educacional de simulação financeira.<br />
          Não constitui recomendação de investimento.
        </p>
      </header>

      {/* Features */}
      <main className="px-6 py-12 space-y-12 max-w-md mx-auto">
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent/50 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg">Número Dominante</h3>
              <p className="text-muted-foreground text-sm">Saiba exatamente qual porcentagem da sua liberdade você já conquistou.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent/50 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg">Tempo Real</h3>
              <p className="text-muted-foreground text-sm">Descubra em quantos anos e meses você atinge sua meta com seus aportes atuais.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent/50 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg">Acelerador Yee</h3>
              <p className="text-muted-foreground text-sm">Veja quanto tempo você economiza investindo apenas R$ 200 a mais por mês.</p>
            </div>
          </div>
        </div>

        {/* Pricing Card */}
        <Card className="border-2 border-primary bg-primary/5 overflow-hidden">
          <div className="bg-primary text-primary-foreground py-2 text-center text-[10px] font-bold uppercase tracking-widest">
            Vagas limitadas para fundadores
          </div>
          <CardContent className="p-8 text-center space-y-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Plano Fundador</h3>
              <div className="flex items-center justify-center gap-2">
                <span className="text-muted-foreground line-through text-sm">De R$ 29,90</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <span className="text-4xl font-bold text-primary">R$ 9,90</span>
                <span className="text-muted-foreground text-sm">/mês</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Preço vitalício garantido para os 100 primeiros fundadores.
                <br />
                Após as 100 vagas, o valor será R$ 29,90/mês.
              </p>
            </div>
            <ul className="text-left space-y-3 text-sm font-medium">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Acesso vitalício ao preço promocional
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Simulações ilimitadas
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Acelerador Yee completo
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Ajuste de taxa personalizada
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Suporte prioritário
              </li>
            </ul>

            <Link href="/onboarding">
              <button className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-opacity">
                Garantir minha vaga de fundador
              </button>
            </Link>
          </CardContent>
        </Card>
      </main>

      <footer className="p-12 text-center text-muted-foreground text-xs space-y-4 max-w-md mx-auto">
        <p>© 2026 Yee Finance. Todos os direitos reservados.</p>
        <p>
          Yee Finance é uma ferramenta de simulação financeira com fins educacionais.
          <br />
          Não realizamos recomendações de investimento.
          <br />
          Resultados podem variar conforme mercado e estratégia.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link href="/politica-privacidade">
            <button className="text-primary hover:underline">Política de Privacidade</button>
          </Link>
          <span className="text-border">•</span>
          <Link href="/termos-uso">
            <button className="text-primary hover:underline">Termos de Uso</button>
          </Link>
        </div>
      </footer>
    </div>
  );
}
