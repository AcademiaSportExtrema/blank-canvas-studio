import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Building, User, KeyRound, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function NovaEmpresa() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    slug: '',
    cnpj: '',
    razao_social: '',
    telefone: '',
    email: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    financeiro_nome: '',
    financeiro_email: '',
    financeiro_telefone: '',
    financeiro_cpf: '',
    email_admin: '',
    senha_admin: '',
    valor_mensal: '297',
    dia_vencimento: '10',
  });

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (field === 'slug') value = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (field === 'estado') value = value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome || !form.slug || !form.cnpj || !form.email_admin || !form.senha_admin || !form.financeiro_nome || !form.financeiro_email) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    if (form.senha_admin.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-empresa', {
        body: form,
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success('Empresa criada com sucesso!');
      navigate('/super-admin/empresas');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao criar empresa');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout title="Nova Empresa">
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/super-admin/empresas">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Nova Empresa</h1>
            <p className="text-muted-foreground">Cadastre uma nova empresa na plataforma</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados da Empresa */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="h-5 w-5" />
                Dados da Empresa
              </CardTitle>
              <CardDescription>Informações cadastrais da empresa.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome da Empresa *</Label>
                  <Input id="nome" placeholder="Ex: Academia Fitness" value={form.nome} onChange={update('nome')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (identificador) *</Label>
                  <Input id="slug" placeholder="Ex: academia-fitness" value={form.slug} onChange={update('slug')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ *</Label>
                  <Input id="cnpj" placeholder="00.000.000/0000-00" value={form.cnpj} onChange={update('cnpj')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="razao_social">Razão Social</Label>
                  <Input id="razao_social" placeholder="Razão social completa" value={form.razao_social} onChange={update('razao_social')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email_empresa">Email Institucional</Label>
                  <Input id="email_empresa" type="email" placeholder="contato@empresa.com" value={form.email} onChange={update('email')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input id="telefone" placeholder="(00) 00000-0000" value={form.telefone} onChange={update('telefone')} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input id="endereco" placeholder="Rua, número, complemento" value={form.endereco} onChange={update('endereco')} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input id="cidade" placeholder="Cidade" value={form.cidade} onChange={update('cidade')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">UF</Label>
                  <Input id="estado" placeholder="SP" maxLength={2} value={form.estado} onChange={update('estado')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input id="cep" placeholder="00000-000" value={form.cep} onChange={update('cep')} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Responsável Financeiro */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Responsável Financeiro
              </CardTitle>
              <CardDescription>Dados do responsável pelo financeiro da empresa.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="financeiro_nome">Nome Completo *</Label>
                  <Input id="financeiro_nome" placeholder="Nome do responsável" value={form.financeiro_nome} onChange={update('financeiro_nome')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="financeiro_email">Email *</Label>
                  <Input id="financeiro_email" type="email" placeholder="financeiro@empresa.com" value={form.financeiro_email} onChange={update('financeiro_email')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="financeiro_telefone">Telefone / WhatsApp</Label>
                  <Input id="financeiro_telefone" placeholder="(00) 00000-0000" value={form.financeiro_telefone} onChange={update('financeiro_telefone')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="financeiro_cpf">CPF</Label>
                  <Input id="financeiro_cpf" placeholder="000.000.000-00" value={form.financeiro_cpf} onChange={update('financeiro_cpf')} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plano / Cobrança */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Plano e Cobrança
              </CardTitle>
              <CardDescription>Defina o valor mensal e o dia de vencimento da assinatura.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valor_mensal">Valor Mensal (R$) *</Label>
                  <Input id="valor_mensal" type="number" min="0" step="0.01" placeholder="297.00" value={form.valor_mensal} onChange={update('valor_mensal')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dia_vencimento">Dia de Vencimento *</Label>
                  <Input id="dia_vencimento" type="number" min="1" max="28" placeholder="10" value={form.dia_vencimento} onChange={update('dia_vencimento')} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Acesso do Administrador */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <KeyRound className="h-5 w-5" />
                Acesso do Administrador
              </CardTitle>
              <CardDescription>Um usuário administrador será criado automaticamente para a empresa.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email_admin">Email do Admin *</Label>
                  <Input id="email_admin" type="email" placeholder="admin@empresa.com" value={form.email_admin} onChange={update('email_admin')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senha_admin">Senha Inicial *</Label>
                  <Input id="senha_admin" type="password" placeholder="Mínimo 6 caracteres" value={form.senha_admin} onChange={update('senha_admin')} />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting} size="lg">
              {isSubmitting ? 'Criando...' : 'Criar Empresa'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
