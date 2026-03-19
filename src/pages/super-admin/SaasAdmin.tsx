import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Users, DollarSign, Plug, BrainCircuit, UserPlus } from 'lucide-react';
import EmpresasContent from '@/components/super-admin/EmpresasContent';
import UsuariosContent from '@/components/super-admin/UsuariosContent';
import FinanceiroContent from '@/components/super-admin/FinanceiroContent';
import { IntegracoesTab } from '@/components/configuracao/IntegracoesTab';
import UsoIaContent from '@/components/super-admin/UsoIaContent';
import LeadsContent from '@/components/super-admin/LeadsContent';

export default function SaasAdmin() {
  return (
    <AppLayout title="Administração SaaS">
      <Tabs defaultValue="empresas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="empresas" className="gap-2">
            <Building className="h-4 w-4" />
            Empresas
          </TabsTrigger>
          <TabsTrigger value="usuarios" className="gap-2">
            <Users className="h-4 w-4" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="financeiro" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="uso-ia" className="gap-2">
            <BrainCircuit className="h-4 w-4" />
            Uso IA
          </TabsTrigger>
          <TabsTrigger value="leads" className="gap-2">
            <UserPlus className="h-4 w-4" />
            Leads
          </TabsTrigger>
          <TabsTrigger value="integracoes" className="gap-2">
            <Plug className="h-4 w-4" />
            Integrações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="empresas">
          <EmpresasContent />
        </TabsContent>

        <TabsContent value="usuarios">
          <UsuariosContent />
        </TabsContent>

        <TabsContent value="financeiro">
          <FinanceiroContent />
        </TabsContent>

        <TabsContent value="uso-ia">
          <UsoIaContent />
        </TabsContent>

        <TabsContent value="integracoes">
          <IntegracoesTab />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}