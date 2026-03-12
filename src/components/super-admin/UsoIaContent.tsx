import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BrainCircuit } from 'lucide-react';

function getMonthOptions() {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    options.push({ value, label });
  }
  return options;
}

export default function UsoIaContent() {
  const monthOptions = getMonthOptions();
  const [mesSelecionado, setMesSelecionado] = useState(monthOptions[0].value);

  const startDate = `${mesSelecionado}-01`;
  const [y, m] = mesSelecionado.split('-').map(Number);
  const endDate = `${y}-${String(m + 1 > 12 ? 1 : m + 1).padStart(2, '0')}-01`;

  const { data: logs, isLoading } = useQuery({
    queryKey: ['ai-usage-logs', mesSelecionado],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_usage_logs')
        .select('empresa_id, funcao, tokens_estimados, created_at')
        .gte('created_at', startDate)
        .lt('created_at', endDate)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: empresas } = useQuery({
    queryKey: ['empresas-list'],
    queryFn: async () => {
      const { data, error } = await supabase.from('empresas').select('id, nome');
      if (error) throw error;
      return data || [];
    },
  });

  const empresaMap = new Map(empresas?.map(e => [e.id, e.nome]) || []);

  // Aggregate by empresa
  const agregado = new Map<string, { nome: string; chamadas: number; tokens: number; ultimoUso: string }>();
  for (const log of logs || []) {
    const existing = agregado.get(log.empresa_id);
    if (existing) {
      existing.chamadas++;
      existing.tokens += log.tokens_estimados;
      if (log.created_at > existing.ultimoUso) existing.ultimoUso = log.created_at;
    } else {
      agregado.set(log.empresa_id, {
        nome: empresaMap.get(log.empresa_id) || log.empresa_id.slice(0, 8),
        chamadas: 1,
        tokens: log.tokens_estimados,
        ultimoUso: log.created_at,
      });
    }
  }

  const rows = Array.from(agregado.values()).sort((a, b) => b.tokens - a.tokens);
  const totalTokens = rows.reduce((s, r) => s + r.tokens, 0);
  const totalChamadas = rows.reduce((s, r) => s + r.chamadas, 0);

  const chartData = rows.slice(0, 10).map(r => ({
    nome: r.nome.length > 15 ? r.nome.slice(0, 15) + '…' : r.nome,
    tokens: r.tokens,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BrainCircuit className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Consumo de IA por Empresa</h2>
        </div>
        <Select value={mesSelecionado} onValueChange={setMesSelecionado}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map(o => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Chamadas</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{totalChamadas}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Tokens Estimados</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{totalTokens.toLocaleString('pt-BR')}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Empresas Ativas</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{rows.length}</p></CardContent>
        </Card>
      </div>

      {chartData.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Top 10 – Tokens por Empresa</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="nome" width={80} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => v.toLocaleString('pt-BR')} />
                <Bar dataKey="tokens" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead className="text-right">Chamadas</TableHead>
                <TableHead className="text-right">Tokens Est.</TableHead>
                <TableHead className="text-right">Último Uso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Carregando…</TableCell></TableRow>
              ) : rows.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Nenhum uso registrado no período</TableCell></TableRow>
              ) : rows.map((r, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{r.nome}</TableCell>
                  <TableCell className="text-right">{r.chamadas}</TableCell>
                  <TableCell className="text-right">{r.tokens.toLocaleString('pt-BR')}</TableCell>
                  <TableCell className="text-right text-muted-foreground text-sm">
                    {new Date(r.ultimoUso).toLocaleDateString('pt-BR')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
