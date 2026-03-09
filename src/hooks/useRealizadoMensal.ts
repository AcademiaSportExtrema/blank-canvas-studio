import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface LancamentoRow {
  condicao_pagamento: string | null;
  mes_competencia: string | null;
  data_inicio: string | null;
  data_lancamento: string | null;
  plano: string | null;
  duracao: string | null;
  valor: number | null;
  entra_meta: boolean | null;
}

interface AgregadorRow {
  agregador: string;
  mes_referencia: string;
  data_recebimento: string | null;
  valor: number;
}

type DurationKey = 'loja' | 'mensal' | 'recorrente' | 'quatro' | 'seis' | 'doze' | 'dezoito' | 'outros';

function isRecorrente(cp: string | null): boolean {
  const upper = (cp || '').toUpperCase();
  return upper.includes('RECORRÊNCIA') || upper.includes('RECORRENCIA');
}

function classifyDuration(l: LancamentoRow): DurationKey {
  if (isRecorrente(l.condicao_pagamento)) return 'recorrente';
  const dur = parseInt(l.duracao || '0', 10);
  if (!dur || dur === 0) return 'loja';
  if (dur === 1) return 'mensal';
  if (dur === 4) return 'quatro';
  if (dur === 6) return 'seis';
  if (dur === 12) return 'doze';
  if (dur === 18) return 'dezoito';
  return 'outros';
}

function isEntuspass(plano: string | null): boolean {
  if (!plano) return false;
  const upper = plano.toUpperCase();
  return upper.includes('ENTUSPASS') || upper.includes('SPORT PASS');
}

/**
 * Hook that calculates "realizado" per month using the same logic as Tabela 2 (Receita por Duração).
 * Returns an array of 12 values (index 0 = Jan, 11 = Dec) for the given year.
 */
export function useRealizadoMensal(empresaId: string | null | undefined, ano: number) {
  // Query 1: lancamentos entra_meta = true
  const { data: lancamentos, isLoading: loadingLanc } = useQuery({
    queryKey: ['realizado-mensal-lancamentos', empresaId],
    queryFn: async () => {
      if (!empresaId) return [];
      const { data, error } = await supabase
        .from('lancamentos')
        .select('condicao_pagamento, mes_competencia, data_inicio, data_lancamento, plano, duracao, valor')
        .eq('empresa_id', empresaId)
        .eq('entra_meta', true);
      if (error) throw error;
      return (data || []) as LancamentoRow[];
    },
    enabled: !!empresaId,
  });

  // Query 2: entuspass lancamentos (entra_meta=false)
  const { data: entuspassLancamentos, isLoading: loadingEntus } = useQuery({
    queryKey: ['realizado-mensal-entuspass', empresaId],
    queryFn: async () => {
      if (!empresaId) return [];
      const { data, error } = await supabase
        .from('lancamentos')
        .select('condicao_pagamento, mes_competencia, data_inicio, data_lancamento, plano, duracao, valor, entra_meta')
        .eq('empresa_id', empresaId)
        .eq('entra_meta', false);
      if (error) throw error;
      return ((data || []) as LancamentoRow[]).filter(l => isEntuspass(l.plano));
    },
    enabled: !!empresaId,
  });

  // Query 3: pagamentos_agregadores
  const { data: agregadores, isLoading: loadingAgreg } = useQuery({
    queryKey: ['realizado-mensal-agregadores', empresaId],
    queryFn: async () => {
      if (!empresaId) return [];
      const { data, error } = await supabase
        .from('pagamentos_agregadores' as any)
        .select('agregador, mes_referencia, data_recebimento, valor')
        .eq('empresa_id', empresaId);
      if (error) throw error;
      return (data || []) as unknown as AgregadorRow[];
    },
    enabled: !!empresaId,
  });

  const realizadoPorMes = useMemo(() => {
    const arr = Array(12).fill(0) as number[];
    const anoStr = String(ano);

    // 1. Duration-based lancamentos (entra_meta=true)
    if (lancamentos?.length) {
      for (const l of lancamentos) {
        const mc = l.mes_competencia;
        if (!mc) continue;

        const cat = classifyDuration(l);

        // Cross-month filter for duration plans
        if (['mensal', 'quatro', 'seis', 'doze', 'dezoito'].includes(cat)) {
          const diM = l.data_inicio?.slice(0, 7);
          const dlM = l.data_lancamento?.slice(0, 7);
          if (diM && dlM && diM !== dlM) continue;
        }

        // Recorrente uses data_lancamento month
        const durMonth = (cat === 'recorrente')
          ? (l.data_lancamento?.slice(0, 7) || mc)
          : mc;

        if (!durMonth.startsWith(anoStr)) continue;
        const mesIdx = parseInt(durMonth.split('-')[1], 10) - 1;
        if (mesIdx < 0 || mesIdx > 11) continue;
        arr[mesIdx] += l.valor || 0;
      }
    }

    // 2. Entuspass / Sport Pass (entra_meta=false)
    if (entuspassLancamentos?.length) {
      for (const l of entuspassLancamentos) {
        const mc = l.data_lancamento?.slice(0, 7);
        if (!mc || !mc.startsWith(anoStr)) continue;
        const mesIdx = parseInt(mc.split('-')[1], 10) - 1;
        if (mesIdx < 0 || mesIdx > 11) continue;
        arr[mesIdx] += l.valor || 0;
      }
    }

    // 3. Agregadores (Wellhub, Total Pass)
    if (agregadores?.length) {
      for (const a of agregadores) {
        const mesKey = a.data_recebimento ? a.data_recebimento.slice(0, 7) : a.mes_referencia;
        if (!mesKey.startsWith(anoStr)) continue;
        const mesIdx = parseInt(mesKey.split('-')[1], 10) - 1;
        if (mesIdx < 0 || mesIdx > 11) continue;
        arr[mesIdx] += a.valor || 0;
      }
    }

    return arr;
  }, [lancamentos, entuspassLancamentos, agregadores, ano]);

  return {
    realizadoPorMes,
    isLoading: loadingLanc || loadingEntus || loadingAgreg,
  };
}
