
import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="px-6 py-6 flex items-center gap-4 max-w-2xl mx-auto">
        <Link href="/">
          <button className="p-2 hover:bg-accent rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </Link>
        <h1 className="text-2xl font-bold">Política de Privacidade</h1>
      </header>

      {/* Content */}
      <main className="px-6 py-8 max-w-2xl mx-auto space-y-8 pb-24">
        <div className="space-y-2">
          <p className="text-muted-foreground">Última atualização: 2026</p>
          <p className="text-foreground">O Yee Finance respeita sua privacidade e protege seus dados.</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">1. Coleta de informações</h2>
          <p className="text-muted-foreground">Coletamos apenas os dados necessários para funcionamento da plataforma, como:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Nome</li>
            <li>Email</li>
            <li>Dados inseridos na simulação financeira</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">2. Uso das informações</h2>
          <p className="text-muted-foreground">Os dados são utilizados exclusivamente para:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Realizar cálculos financeiros</li>
            <li>Melhorar a experiência do usuário</li>
            <li>Comunicação sobre a plataforma</li>
          </ul>
          <p className="text-muted-foreground">Não vendemos ou compartilhamos seus dados com terceiros.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">3. Armazenamento</h2>
          <p className="text-muted-foreground">Seus dados são armazenados de forma segura e protegida.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">4. Cancelamento</h2>
          <p className="text-muted-foreground">Você pode solicitar exclusão dos seus dados a qualquer momento.</p>
          <p className="text-muted-foreground">Contato: suporte@yeefinance.com</p>
        </section>
      </main>
    </div>
  );
}
