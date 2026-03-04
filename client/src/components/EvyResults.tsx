import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  EvyOutput,
  formatarMoeda,
  formatarPercentual,
  formatarMeses,
} from "@/lib/evyCalculations";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { TrendingUp, Target, Calendar, Zap } from "lucide-react";

interface EvyResultsProps {
  data: EvyOutput;
}

export default function EvyResults({ data }: EvyResultsProps) {
  return (
    <div className="space-y-6 w-full">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Dias de Liberdade */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Dias de Liberdade
              </CardTitle>
              <Calendar className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.diasDeLiberdadeHoje}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tempo que seu patrimônio sustenta seu estilo de vida
            </p>
          </CardContent>
        </Card>

        {/* Renda Mensal Atual */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Renda Mensal Atual
              </CardTitle>
              <Zap className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatarMoeda(data.rendaMensalAtual)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Renda passiva gerada hoje
            </p>
          </CardContent>
        </Card>

        {/* Patrimônio Necessário */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Patrimônio Necessário
              </CardTitle>
              <Target className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatarMoeda(data.patrimonioNecessario)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Para atingir sua meta
            </p>
          </CardContent>
        </Card>

        {/* Tempo para Independência */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Tempo Restante
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatarMeses(data.mesesParaIndependencia)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Para atingir independência
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progresso de Independência */}
      <Card>
        <CardHeader>
          <CardTitle>Progresso para Independência Financeira</CardTitle>
          <CardDescription>
            Você está {formatarPercentual(data.percentualIndependencia)} perto
            de sua meta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Independência</span>
              <span className="text-muted-foreground">
                {formatarPercentual(data.percentualIndependencia)}
              </span>
            </div>
            <Progress
              value={data.percentualIndependencia}
              className="h-3"
            />
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <p className="text-xs text-muted-foreground">Atual</p>
              <p className="text-sm font-semibold">
                {formatarPercentual(data.percentualIndependencia)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Meta</p>
              <p className="text-sm font-semibold">100%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Faltam</p>
              <p className="text-sm font-semibold">
                {formatarPercentual(100 - data.percentualIndependencia)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projeções */}
      <Card>
        <CardHeader>
          <CardTitle>Projeções de Patrimônio</CardTitle>
          <CardDescription>
            Evolução esperada do seu patrimônio nos próximos anos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.projections}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="ano"
                label={{ value: "Anos", position: "insideBottomRight", offset: -5 }}
              />
              <YAxis
                label={{ value: "Patrimônio (R$)", angle: -90, position: "insideLeft" }}
              />
              <Tooltip
                formatter={(value) => formatarMoeda(value as number)}
                labelFormatter={(label) => `Ano ${label}`}
              />
              <Bar dataKey="patrimonio" fill="#3b82f6" name="Patrimônio" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Renda Mensal Projetada */}
      <Card>
        <CardHeader>
          <CardTitle>Renda Mensal Projetada</CardTitle>
          <CardDescription>
            Renda passiva esperada em cada horizonte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.projections}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="ano"
                label={{ value: "Anos", position: "insideBottomRight", offset: -5 }}
              />
              <YAxis
                label={{ value: "Renda Mensal (R$)", angle: -90, position: "insideLeft" }}
              />
              <Tooltip
                formatter={(value) => formatarMoeda(value as number)}
                labelFormatter={(label) => `Ano ${label}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="rendaMensal"
                stroke="#8b5cf6"
                name="Renda Mensal"
                strokeWidth={2}
                dot={{ fill: "#8b5cf6", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabela de Projeções Detalhadas */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes das Projeções</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Ano</th>
                  <th className="text-right py-3 px-4 font-semibold">Patrimônio</th>
                  <th className="text-right py-3 px-4 font-semibold">Renda Mensal</th>
                  <th className="text-right py-3 px-4 font-semibold">Independência</th>
                </tr>
              </thead>
              <tbody>
                {data.projections.map((proj, idx) => (
                  <tr
                    key={idx}
                    className="border-b hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 px-4">{proj.ano} ano{proj.ano !== 1 ? "s" : ""}</td>
                    <td className="text-right py-3 px-4 font-medium">
                      {formatarMoeda(proj.patrimonio)}
                    </td>
                    <td className="text-right py-3 px-4 font-medium">
                      {formatarMoeda(proj.rendaMensal)}
                    </td>
                    <td className="text-right py-3 px-4">
                      <span
                        className={`font-semibold ${
                          proj.independencia >= 100
                            ? "text-green-600"
                            : "text-amber-600"
                        }`}
                      >
                        {formatarPercentual(proj.independencia)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
