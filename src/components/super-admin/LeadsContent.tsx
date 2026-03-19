import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Check, X, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Lead {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  nome_empresa: string;
  segmento: string | null;
  qtd_consultoras: string | null;
  como_conheceu: string | null;
  status: string;
  created_at: string;
}

export default function LeadsContent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [approveDialogLead, setApproveDialogLead] = useState<Lead | null>(null);
  const [slug, setSlug] = useState('');
  const [senhaAdmin, setSenhaAdmin] = useState('');
  const [filter, setFilter] = useState<'novo' | 'todos'>('novo');

  const { data: leads, isLoading } = useQuery({
    queryKey: ['site-leads', filter],
    queryFn: async () => {
      let query = supabase.from('site_leads' as any).select('*').order('created_at', { ascending: false });
      if (filter === 'novo') query = query.eq('status', 'novo');
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as Lead[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ lead, slug, senha }: { lead: Lead; slug: string; senha: string }) => {
      // 1. Create empresa via edge function
      const { data, error } = await supabase.functions.invoke('create-empresa', {
        body: {
          nome: lead.nome_empresa,
          slug,
          email_admin: lead.email,
          senha_admin: senha,
          telefone: lead.telefone,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // 2. Update lead status
      const { error: updateError } = await (supabase.from('site_leads' as any) as any)
        .update({ status: 'aprovado', empresa_id: data.empresa_id, aprovado_por: (await supabase.auth.getUser()).data.user?.id })
        .eq('id', lead.id);
      if (updateError) throw updateError;

      return data;
    },
    onSuccess: () => {
      toast({ title: 'Lead aprovado!', description: 'Empresa e usuário admin criados com sucesso.' });
      queryClient.invalidateQueries({ queryKey: ['site-leads'] });
      setApproveDialogLead(null);
      setSlug('');
      setSenhaAdmin('');
    },
    onError: (err: any) => {
      toast({ title: 'Erro ao aprovar lead', description: err.message, variant: 'destructive' });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (leadId: string) => {
      const { error } = await (supabase.from('site_leads' as any) as any)
        .update({ status: 'rejeitado' })
        .eq('id', leadId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Lead rejeitado' });
      queryClient.invalidateQueries({ queryKey: ['site-leads'] });
    },
  });

  const openApprove = (lead: Lead) => {
    setApproveDialogLead(lead);
    setSlug(lead.nome_empresa.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''));
    setSenhaAdmin('');
  };

  const statusBadge = (status: string) => {
    if (status === 'novo') return <Badge variant="outline" className="border-warning text-warning">Novo</Badge>;
    if (status === 'aprovado') return <Badge className="bg-success text-success-foreground">Aprovado</Badge>;
    return <Badge variant="destructive">Rejeitado</Badge>;
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Leads do Site</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant={filter === 'novo' ? 'default' : 'outline'} onClick={() => setFilter('novo')}>Pendentes</Button>
            <Button size="sm" variant={filter === 'todos' ? 'default' : 'outline'} onClick={() => setFilter('todos')}>Todos</Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : !leads?.length ? (
            <p className="text-center text-muted-foreground py-8">Nenhum lead encontrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Segmento</TableHead>
                    <TableHead>Consultoras</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map(lead => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.nome}</TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>{lead.nome_empresa}</TableCell>
                      <TableCell>{lead.segmento || '—'}</TableCell>
                      <TableCell>{lead.qtd_consultoras || '—'}</TableCell>
                      <TableCell>{format(new Date(lead.created_at), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{statusBadge(lead.status)}</TableCell>
                      <TableCell className="text-right">
                        {lead.status === 'novo' && (
                          <div className="flex gap-1 justify-end">
                            <Button size="sm" variant="outline" className="text-success" onClick={() => openApprove(lead)}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-destructive" onClick={() => rejectMutation.mutate(lead.id)} disabled={rejectMutation.isPending}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!approveDialogLead} onOpenChange={open => !open && setApproveDialogLead(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprovar Lead — {approveDialogLead?.nome_empresa}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Nome:</span> {approveDialogLead?.nome}</div>
              <div><span className="text-muted-foreground">Email:</span> {approveDialogLead?.email}</div>
              <div><span className="text-muted-foreground">Telefone:</span> {approveDialogLead?.telefone || '—'}</div>
              <div><span className="text-muted-foreground">Consultoras:</span> {approveDialogLead?.qtd_consultoras || '—'}</div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug da empresa *</Label>
              <Input id="slug" value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="minha-empresa" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senhaAdmin">Senha do admin *</Label>
              <Input id="senhaAdmin" type="password" value={senhaAdmin} onChange={e => setSenhaAdmin(e.target.value)} placeholder="Mínimo 6 caracteres" minLength={6} />
            </div>
            {senhaAdmin && senhaAdmin.length < 6 && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" /> A senha deve ter pelo menos 6 caracteres
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogLead(null)}>Cancelar</Button>
            <Button onClick={() => approveDialogLead && approveMutation.mutate({ lead: approveDialogLead, slug, senha: senhaAdmin })} disabled={!slug || senhaAdmin.length < 6 || approveMutation.isPending}>
              {approveMutation.isPending ? 'Criando...' : 'Aprovar e criar empresa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
