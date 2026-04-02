
import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="px-6 py-6 flex items-center gap-4 max-w-2xl mx-auto">
        <Link href="/">
          <button className="p-2 hover:bg-accent rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </Link>
        <h1 className="text-2xl font-bold">Termos de Uso</h1>
      </header>

      {/* Content */}
      <main className="px-6 py-8 max-w-2xl mx-auto space-y-8 pb-24">
        <p className="text-foreground">Ao utilizar o Yee Finance, você concorda com os seguintes termos:</p>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">1. Natureza da plataforma</h2>
          <p className="text-muted-foreground">O Yee Finance é uma ferramenta de simulação financeira com finalidade educacional.</p>
          <p className="text-muted-foreground">Não oferecemos consultoria, recomendação ou indicação de investimentos.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">2. Responsabilidade</h2>
          <p className="text-muted-foreground">As decisões financeiras são de total responsabilidade do usuário.</p>
          <p className="text-muted-foreground">Resultados simulados podem não refletir resultados reais.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">3. Plano Fundador</h2>
          <p className="text-muted-foreground">O preço promocional de R$ 9,90/mês é válido para os 100 primeiros fundadores.</p>
          <p className="text-muted-foreground">Após esse limite, o valor padrão será R$ 29,90/mês.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">4. Modificações</h2>
          <p className="text-muted-foreground">Podemos atualizar funcionalidades e termos a qualquer momento.</p>
        </section>
      </main>
    </div>
  );
}
