import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { EvyInput } from "@/lib/evyCalculations";

interface EvyFormProps {
  onSubmit: (data: EvyInput) => void;
  isLoading?: boolean;
}

export default function EvyForm({ onSubmit, isLoading = false }: EvyFormProps) {
  const [formData, setFormData] = useState<EvyInput>({
    patrimonioAtual: 50000,
    aporteMensal: 1000,
    rendaMensalDesejada: 5000,
    taxaAnual: 0.04,
    horizontes: [3, 5, 10],
  });

  const handleChange = (field: keyof EvyInput, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: typeof value === "string" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Parâmetros Financeiros</CardTitle>
        <CardDescription>
          Insira seus dados financeiros para calcular sua independência
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patrimônio Atual */}
            <div className="space-y-2">
              <Label htmlFor="patrimonio" className="text-sm font-medium">
                Patrimônio Atual (R$)
              </Label>
              <Input
                id="patrimonio"
                type="number"
                min="0"
                step="1000"
                value={formData.patrimonioAtual}
                onChange={(e) => handleChange("patrimonioAtual", e.target.value)}
                className="h-10"
                placeholder="Ex: 50000"
              />
              <p className="text-xs text-muted-foreground">
                Seu patrimônio total atual
              </p>
            </div>

            {/* Aporte Mensal */}
            <div className="space-y-2">
              <Label htmlFor="aporte" className="text-sm font-medium">
                Aporte Mensal (R$)
              </Label>
              <Input
                id="aporte"
                type="number"
                min="0"
                step="100"
                value={formData.aporteMensal}
                onChange={(e) => handleChange("aporteMensal", e.target.value)}
                className="h-10"
                placeholder="Ex: 1000"
              />
              <p className="text-xs text-muted-foreground">
                Quanto você investe por mês
              </p>
            </div>

            {/* Renda Mensal Desejada */}
            <div className="space-y-2">
              <Label htmlFor="renda" className="text-sm font-medium">
                Renda Mensal Desejada (R$)
              </Label>
              <Input
                id="renda"
                type="number"
                min="0"
                step="100"
                value={formData.rendaMensalDesejada}
                onChange={(e) => handleChange("rendaMensalDesejada", e.target.value)}
                className="h-10"
                placeholder="Ex: 5000"
              />
              <p className="text-xs text-muted-foreground">
                Renda passiva que você deseja
              </p>
            </div>

            {/* Taxa Anual */}
            <div className="space-y-2">
              <Label htmlFor="taxa" className="text-sm font-medium">
                Taxa Anual (%)
              </Label>
              <Input
                id="taxa"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.taxaAnual ? formData.taxaAnual * 100 : 4}
                onChange={(e) => handleChange("taxaAnual", parseFloat(e.target.value) / 100)}
                className="h-10"
                placeholder="Ex: 4"
              />
              <p className="text-xs text-muted-foreground">
                Retorno anual esperado (padrão: 4%)
              </p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 font-medium"
          >
            {isLoading ? "Calculando..." : "Calcular Independência Financeira"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
