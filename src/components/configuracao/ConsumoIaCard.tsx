import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit } from 'lucide-react';

export function ConsumoIaCard() {
  const now = new Date();
  const mesAtual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const startDate = `${mesAtual}-01`;
  const [y, m] = mesAtual.split('-').map(Number);
  const endDate = `${y}-${String(m + 1 > 12 ? 1 : m + 1).padStart(2, '0')}-01`;

  const { data, isLoading } = useQuery({
    queryKey: ['ai-usage-mine', mesAtual],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_usage_logs')
        .select('tokens_estimados, funcao')
        .gte('created_at', startDate)
        .lt('created_at', endDate);
      if (error) throw error;
      return data || [];
    },
  });

  const totalTokens = data?.reduce((s, r) => s + r.tokens_estimados, 0) ?? 0;
  const totalChamadas = data?.length ?? 0;
  const coachCalls = data?.filter(r => r.funcao === 'ai-coach').length ?? 0;
  const analistaCalls = data?.filter(r => r.funcao === 'ai-analista').length ?? 0;

  const mesLabel = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <BrainCircuit className="h-4 w-4 text-primary" />
          Consumo de IA – {mesLabel}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{totalChamadas}</p>
              <p className="text-xs text-muted-foreground">Chamadas</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{totalTokens.toLocaleString('pt-BR')}</p>
              <p className="text-xs text-muted-foreground">Tokens Est.</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{coachCalls}</p>
              <p className="text-xs text-muted-foreground">Coach IA</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{analistaCalls}</p>
              <p className="text-xs text-muted-foreground">Analista IA</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
