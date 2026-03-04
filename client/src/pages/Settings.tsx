import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowLeft, Sliders } from "lucide-react";

export default function Settings() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
              <span className="text-white font-bold text-xs">E</span>
            </div>
            <span className="text-sm font-semibold text-slate-900">Configurações</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      {/* Main */}
      <main className="container py-12">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Padrões */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                Seu Ritmo de Retorno
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-900">
                  Retorno Anual Esperado (%)
                </label>
                <input
                  type="number"
                  defaultValue="4"
                  className="mt-2 w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>

          {/* Sobre */}
          <Card>
            <CardHeader>
              <CardTitle>Sobre EVY</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <p>
                <strong>EVY CORE v1</strong> — Medindo liberdade em dias
              </p>
              <p>
                Um medidor minimalista de independência financeira. Quanto tempo seu patrimônio sustenta sua vida?
              </p>
              <p className="text-xs text-slate-500">
                Versão 1.0.0 | Desenvolvido com precisão
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
