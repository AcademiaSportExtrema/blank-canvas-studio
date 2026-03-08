import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DollarSign, Building, CheckCircle, XCircle, Clock, TrendingUp, Pencil, RefreshCw, CreditCard, Download, User, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { exportToCSV } from '@/lib/csv';
import { differenceInDays, format, addMonths, setDate } from 'date-fns';

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
  financeiro_nome: string | null;
  financeiro_email: string | null;
  financeiro_telefone: string | null;
};

type Pagamento = {
  id: string;
  empresa_id: string;
  valor: number;
  data_pagamento: string;
  metodo: string;
  mes_referencia: string;
  observacao: string | null;
  created_at: string;
};

const STATUS_OPTIONS = [
  { value: 'active', label: 'Ativa' },
  { value: 'past_due', label: 'Inadimplente' },
  { value: 'canceled', label: 'Cancelada' },
  { value: 'trialing', label: 'Em Trial' },
];

const METODO_OPTIONS = [
  { value: 'pix', label: 'PIX' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'cartao', label: 'Cartão' },
  { value: 'transferencia', label: 'Transferência' },
];

const statusConfig: Record<string, { label: string; variant: 'default' | 'destructive' | 'secondary' | 'outline' }> = {
  active: { label: 'Ativa', variant: 'default' },
  past_due: { label: 'Inadimplente', variant: 'destructive' },
  canceled: { label: 'Cancelada', variant: 'secondary' },
  trialing: { label: 'Em Trial', variant: 'outline' },
};

function calcDiasAtraso(proximo: string | null, status: string): number {
  if (!proximo || status === 'canceled') return 0;
  const diff = differenceInDays(new Date(), new Date(proximo));
  return diff > 0 ? diff : 0;
}

function calcProximoVencimento(diaVencimento: number): string {
  const now = new Date();
  let next = setDate(now, diaVencimento);
  if (next <= now) {
    next = setDate(addMonths(now, 1), diaVencimento);
  }
  return format(next, 'yyyy-MM-dd');
}

export default function Financeiro() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editEmpresa, setEditEmpresa] = useState<Empresa | null>(null);
  const [editValor, setEditValor] = useState('');
  const [editDia, setEditDia] = useState('');

  // Payment dialog
  const [payEmpresa, setPayEmpresa] = useState<Empresa | null>(null);
  const [payValor, setPayValor] = useState('');
  const [payData, setPayData] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [payMetodo, setPayMetodo] = useState('pix');
  const [payMesRef, setPayMesRef] = useState(format(new Date(), 'yyyy-MM'));
  const [payObs, setPayObs] = useState('');

  // History
  const [historyEmpresaId, setHistoryEmpresaId] = useState<string | null>(null);
  const [historyEmpresaNome, setHistoryEmpresaNome] = useState('');

  const { data: empresas, isLoading } = useQuery({
    queryKey: ['empresas-financeiro'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('empresas')
        .select('id, nome, plano, subscription_status, ativo, created_at, trial_ends_at, valor_mensal, dia_vencimento, ultimo_pagamento_em, proximo_vencimento, financeiro_nome, financeiro_email, financeiro_telefone')
        .order('nome');
      if (error) throw error;
      return data as Empresa[];
    },
  });

  const { data: pagamentos } = useQuery({
    queryKey: ['pagamentos-saas', historyEmpresaId],
    enabled: !!historyEmpresaId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pagamentos_saas')
        .select('id, empresa_id, valor, data_pagamento, metodo, mes_referencia, observacao, created_at')
        .eq('empresa_id', historyEmpresaId!)
        .order('data_pagamento', { ascending: false });
      if (error) throw error;
      return data as Pagamento[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (params: { id: string; updates: Record<string, unknown> }) => {
      const { error } = await supabase.from('empresas').update(params.updates).eq('id', params.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresas-financeiro'] });
      toast.success('Empresa atualizada');
    },
    onError: () => toast.error('Erro ao atualizar empresa'),
  });

  const payMutation = useMutation({
    mutationFn: async () => {
      if (!payEmpresa || !user) return;
      const { error: insertErr } = await supabase.from('pagamentos_saas').insert({
        empresa_id: payEmpresa.id,
        valor: parseFloat(payValor) || 0,
        data_pagamento: payData,
        metodo: payMetodo,
        mes_referencia: payMesRef,
        observacao: payObs || null,
        registrado_por: user.id,
      });
      if (insertErr) throw insertErr;

      const novoProximo = calcProximoVencimento(payEmpresa.dia_vencimento);
      const { error: updateErr } = await supabase
        .from('empresas')
        .update({
          ultimo_pagamento_em: new Date(payData).toISOString(),
          proximo_vencimento: novoProximo,
          subscription_status: 'active',
        })
        .eq('id', payEmpresa.id);
      if (updateErr) throw updateErr;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresas-financeiro'] });
      queryClient.invalidateQueries({ queryKey: ['pagamentos-saas'] });
      toast.success('Pagamento registrado');
      setPayEmpresa(null);
    },
    onError: () => toast.error('Erro ao registrar pagamento'),
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
      updates: { valor_mensal: parseFloat(editValor) || 0, dia_vencimento: parseInt(editDia) || 10 },
    });
    setEditEmpresa(null);
  };

  const openPay = (empresa: Empresa) => {
    setPayEmpresa(empresa);
    setPayValor(String(empresa.valor_mensal ?? 0));
    setPayData(format(new Date(), 'yyyy-MM-dd'));
    setPayMetodo('pix');
    setPayMesRef(format(new Date(), 'yyyy-MM'));
    setPayObs('');
  };

  const changeStatus = (id: string, newStatus: string) => {
    updateMutation.mutate({ id, updates: { subscription_status: newStatus } });
  };

  const handleExportCSV = () => {
    const rows = filtered.map(e => ({
      Empresa: e.nome,
      Plano: e.plano ?? '',
      'Valor Mensal': e.valor_mensal,
      Status: statusConfig[e.subscription_status]?.label ?? e.subscription_status,
      'Dias Atraso': calcDiasAtraso(e.proximo_vencimento, e.subscription_status),
      'Próx. Vencimento': e.proximo_vencimento ?? '',
      'Último Pagamento': e.ultimo_pagamento_em ? format(new Date(e.ultimo_pagamento_em), 'dd/MM/yyyy') : '',
      'Resp. Financeiro': e.financeiro_nome ?? '',
      'Email Financeiro': e.financeiro_email ?? '',
      'Tel. Financeiro': e.financeiro_telefone ?? '',
    }));
    exportToCSV(rows, `financeiro-saas-${format(new Date(), 'yyyy-MM-dd')}.csv`);
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
                    <p className="text-2xl font-bold">{k.value}</p>
                    <p className="text-sm text-muted-foreground">{k.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Status por Empresa
              </CardTitle>
              <div className="flex items-center gap-2">
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
                <Button variant="outline" size="sm" onClick={handleExportCSV}>
                  <Download className="h-4 w-4 mr-1" />
                  CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-center py-8">Carregando...</p>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-200 dark:bg-green-900 inline-block" /> Pago no mês</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-200 dark:bg-yellow-900 inline-block" /> Vence em 5 dias</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-destructive/20 inline-block" /> Em atraso</span>
                </div>
                <div className="overflow-auto">
                <TooltipProvider>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Empresa</TableHead>
                        <TableHead>Plano</TableHead>
                        <TableHead>Valor Mensal</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Dias Atraso</TableHead>
                        <TableHead>Próx. Vencimento</TableHead>
                        <TableHead>Último Pagamento</TableHead>
                        <TableHead>Resp. Financeiro</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((empresa) => {
                        const cfg = statusConfig[empresa.subscription_status] ?? statusConfig.active;
                        const diasAtraso = calcDiasAtraso(empresa.proximo_vencimento, empresa.subscription_status);
                        return (
                          <TableRow key={empresa.id} className={
                            diasAtraso > 0
                              ? 'bg-destructive/5'
                              : empresa.proximo_vencimento && differenceInDays(new Date(empresa.proximo_vencimento), new Date()) <= 5 && differenceInDays(new Date(empresa.proximo_vencimento), new Date()) >= 0 && empresa.subscription_status !== 'canceled'
                                ? 'bg-yellow-50 dark:bg-yellow-950/20'
                                : empresa.ultimo_pagamento_em && new Date(empresa.ultimo_pagamento_em).getMonth() === new Date().getMonth() && new Date(empresa.ultimo_pagamento_em).getFullYear() === new Date().getFullYear()
                                  ? 'bg-green-50 dark:bg-green-950/20'
                                  : ''
                          }>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-muted-foreground" />
                                {empresa.nome}
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{empresa.plano ?? '—'}</TableCell>
                            <TableCell>{fmt(empresa.valor_mensal ?? 0)}</TableCell>
                            <TableCell>
                              <Select value={empresa.subscription_status} onValueChange={(v) => changeStatus(empresa.id, v)}>
                                <SelectTrigger className="w-[140px] h-8">
                                  <Badge variant={cfg.variant} className="cursor-pointer">{cfg.label}</Badge>
                                </SelectTrigger>
                                <SelectContent>
                                  {STATUS_OPTIONS.map(s => (
                                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              {diasAtraso > 0 ? (
                                <span className="flex items-center gap-1 text-destructive font-semibold">
                                  <AlertTriangle className="h-4 w-4" />
                                  {diasAtraso}d
                                </span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-muted-foreground">{fmtDate(empresa.proximo_vencimento)}</TableCell>
                            <TableCell className="text-muted-foreground">{fmtDate(empresa.ultimo_pagamento_em)}</TableCell>
                            <TableCell>
                              {empresa.financeiro_nome ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="flex items-center gap-1 cursor-help text-sm">
                                      <User className="h-3 w-3" />
                                      {empresa.financeiro_nome}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="text-xs space-y-1">
                                      {empresa.financeiro_email && <p>{empresa.financeiro_email}</p>}
                                      {empresa.financeiro_telefone && <p>{empresa.financeiro_telefone}</p>}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" title="Editar cobrança" onClick={() => openEdit(empresa)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" title="Registrar pagamento" onClick={() => openPay(empresa)}>
                                  <CreditCard className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" title="Histórico" onClick={() => { setHistoryEmpresaId(empresa.id); setHistoryEmpresaNome(empresa.nome); }}>
                                  <Clock className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TooltipProvider>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
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

      {/* Payment Dialog */}
      <Dialog open={!!payEmpresa} onOpenChange={() => setPayEmpresa(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pagamento — {payEmpresa?.nome}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Valor Recebido (R$)</Label>
              <Input type="number" value={payValor} onChange={e => setPayValor(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Data do Pagamento</Label>
              <Input type="date" value={payData} onChange={e => setPayData(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Método</Label>
              <Select value={payMetodo} onValueChange={setPayMetodo}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {METODO_OPTIONS.map(m => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Mês Referência</Label>
              <Input type="month" value={payMesRef} onChange={e => setPayMesRef(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Observação</Label>
              <Input value={payObs} onChange={e => setPayObs(e.target.value)} placeholder="Opcional" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayEmpresa(null)}>Cancelar</Button>
            <Button onClick={() => payMutation.mutate()} disabled={payMutation.isPending}>Registrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={!!historyEmpresaId} onOpenChange={() => setHistoryEmpresaId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Histórico de Pagamentos — {historyEmpresaNome}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[400px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Mês Ref.</TableHead>
                  <TableHead>Observação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagamentos && pagamentos.length > 0 ? pagamentos.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>{fmtDate(p.data_pagamento)}</TableCell>
                    <TableCell>{fmt(p.valor)}</TableCell>
                    <TableCell className="capitalize">{p.metodo}</TableCell>
                    <TableCell>{p.mes_referencia}</TableCell>
                    <TableCell className="text-muted-foreground">{p.observacao ?? '—'}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Nenhum pagamento registrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
