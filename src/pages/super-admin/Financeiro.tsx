import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Building, CheckCircle, XCircle, Clock, TrendingUp, Pencil, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

type Empresa = {
  id: string;
  nome: string;
  plano: string | null;
  subscription_status: string;
  ativo: boolean;
  created_at: string;
  trial_ends_at: string | null;
  valor_mensal: number;
  dia_vencimento: number;
  ultimo_pagamento_em: string | null;
  proximo_vencimento: string | null;
};

const STATUS_OPTIONS = [
  { value: 'active', label: 'Ativa' },
  { value: 'past_due', label: 'Inadimplente' },
  { value: 'canceled', label: 'Cancelada' },
  { value: 'trialing', label: 'Em Trial' },
];

const statusConfig: Record<string, { label: string; variant: 'default' | 'destructive' | 'secondary' | 'outline' }> = {
  active: { label: 'Ativa', variant: 'default' },
  past_due: { label: 'Inadimplente', variant: 'destructive' },
  canceled: { label: 'Cancelada', variant: 'secondary' },
  trialing: { label: 'Em Trial', variant: 'outline' },
};

export default function Financeiro() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editEmpresa, setEditEmpresa] = useState<Empresa | null>(null);
  const [editValor, setEditValor] = useState('');
  const [editDia, setEditDia] = useState('');

  const { data: empresas, isLoading } = useQuery({
    queryKey: ['empresas-financeiro'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('empresas')
        .select('id, nome, plano, subscription_status, ativo, created_at, trial_ends_at, valor_mensal, dia_vencimento, ultimo_pagamento_em, proximo_vencimento')
        .order('nome');
      if (error) throw error;
      return data as Empresa[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (params: { id: string; updates: Record<string, unknown> }) => {
      const { error } = await supabase
        .from('empresas')
        .update(params.updates)
        .eq('id', params.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresas-financeiro'] });
      toast.success('Empresa atualizada com sucesso');
    },
    onError: () => toast.error('Erro ao atualizar empresa'),
  });

  const filtered = empresas?.filter(e => statusFilter === 'all' || e.subscription_status === statusFilter) ?? [];

  const ativas = empresas?.filter(e => e.subscription_status === 'active').length ?? 0;
  const inadimplentes = empresas?.filter(e => e.subscription_status === 'past_due').length ?? 0;
  const canceladas = empresas?.filter(e => e.subscription_status === 'canceled').length ?? 0;
  const emTrial = empresas?.filter(e => e.subscription_status === 'trialing').length ?? 0;
  const mrr = empresas?.filter(e => e.subscription_status === 'active').reduce((sum, e) => sum + (e.valor_mensal ?? 0), 0) ?? 0;

  const openEdit = (empresa: Empresa) => {
    setEditEmpresa(empresa);
    setEditValor(String(empresa.valor_mensal ?? 0));
    setEditDia(String(empresa.dia_vencimento ?? 10));
  };

  const saveEdit = () => {
    if (!editEmpresa) return;
    updateMutation.mutate({
      id: editEmpresa.id,
      updates: {
        valor_mensal: parseFloat(editValor) || 0,
        dia_vencimento: parseInt(editDia) || 10,
      },
    });
    setEditEmpresa(null);
  };

  const changeStatus = (id: string, newStatus: string) => {
    updateMutation.mutate({ id, updates: { subscription_status: newStatus } });
  };

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString('pt-BR') : '—';

  const kpis = [
    { label: 'Ativas', value: ativas, icon: CheckCircle, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Inadimplentes', value: inadimplentes, icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
    { label: 'Canceladas', value: canceladas, icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted' },
    { label: 'Em Trial', value: emTrial, icon: RefreshCw, color: 'text-accent-foreground', bg: 'bg-accent/10' },
    { label: 'MRR', value: fmt(mrr), icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10', isText: true },
  ];

  return (
    <AppLayout title="Financeiro">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Financeiro</h1>
          <p className="text-muted-foreground">Gestão de assinaturas e cobrança das empresas</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {kpis.map(k => (
            <Card key={k.label}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${k.bg}`}>
                    <k.icon className={`h-5 w-5 ${k.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{k.isText ? k.value : k.value}</p>
                    <p className="text-sm text-muted-foreground">{k.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Status por Empresa
              </CardTitle>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {STATUS_OPTIONS.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-center py-8">Carregando...</p>
            ) : (
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Valor Mensal</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Próx. Vencimento</TableHead>
                      <TableHead>Último Pagamento</TableHead>
                      <TableHead>Trial até</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((empresa) => {
                      const cfg = statusConfig[empresa.subscription_status] ?? statusConfig.active;
                      return (
                        <TableRow key={empresa.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-muted-foreground" />
                              {empresa.nome}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{empresa.plano ?? '—'}</TableCell>
                          <TableCell>{fmt(empresa.valor_mensal ?? 0)}</TableCell>
                          <TableCell>
                            <Select
                              value={empresa.subscription_status}
                              onValueChange={(v) => changeStatus(empresa.id, v)}
                            >
                              <SelectTrigger className="w-[140px] h-8">
                                <Badge variant={cfg.variant} className="cursor-pointer">
                                  {cfg.label}
                                </Badge>
                              </SelectTrigger>
                              <SelectContent>
                                {STATUS_OPTIONS.map(s => (
                                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{fmtDate(empresa.proximo_vencimento)}</TableCell>
                          <TableCell className="text-muted-foreground">{fmtDate(empresa.ultimo_pagamento_em)}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {empresa.trial_ends_at ? fmtDate(empresa.trial_ends_at) : '—'}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => openEdit(empresa)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!editEmpresa} onOpenChange={() => setEditEmpresa(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cobrança — {editEmpresa?.nome}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Valor Mensal (R$)</Label>
              <Input type="number" value={editValor} onChange={e => setEditValor(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Dia de Vencimento</Label>
              <Input type="number" min={1} max={28} value={editDia} onChange={e => setEditDia(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditEmpresa(null)}>Cancelar</Button>
            <Button onClick={saveEdit} disabled={updateMutation.isPending}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
