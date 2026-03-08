

## Análise: O sistema está preparado para SaaS multi-empresa?

### O que JÁ existe

A estrutura multi-tenant está bem montada:

- **Tabela `empresas`** com `subscription_status` (active, past_due, canceled, trialing), `trial_ends_at`, `ativo`
- **Função `is_empresa_active()`** que verifica status ativo + assinatura válida ou trial vigente
- **`ProtectedRoute`** bloqueia acesso e redireciona para `/empresa-bloqueada` quando empresa está inativa
- **Página `EmpresaBloqueada`** com mensagem de acesso suspenso
- **Painel super_admin** com páginas de Empresas (criar, ativar/desativar) e Financeiro (visualização de status)
- **RLS completo** com isolamento por `empresa_id` em todas as tabelas
- **Edge Function `create-empresa`** para provisionar empresa + admin + permissões

### O que FALTA para funcionar como SaaS com cobrança

1. **Integração de pagamento (Stripe)** -- Não existe. O `subscription_status` é gerenciado manualmente. Não há cobrança automática, checkout, webhooks, nem gestão de planos/preços.

2. **Tabela de planos/preços** -- Não existe definição de planos (ex: Básico, Pro, Enterprise) com limites (número de consultoras, uploads, etc.).

3. **Webhook para atualizar status** -- Sem webhook do Stripe, o `subscription_status` não muda automaticamente quando um pagamento falha ou é cancelado.

4. **Portal do cliente para billing** -- A empresa-cliente não consegue ver/gerenciar sua assinatura, trocar plano, atualizar cartão, ver faturas.

5. **Controle de limites por plano** -- Sem limites de uso (ex: máximo de consultoras, uploads por mês).

6. **Trial automático** -- `trial_ends_at` existe no banco mas não há fluxo de onboarding com trial automático.

7. **Página Financeiro do super_admin** -- É apenas visualização estática, sem valores de receita, histórico de pagamentos, ou ações de cobrança.

---

### Plano de implementação

#### Fase 1: Integração Stripe (core)
- Habilitar Stripe via ferramenta Lovable
- Criar produtos/preços no Stripe (planos mensais)
- Criar Edge Function de checkout que gera uma Stripe Checkout Session vinculada à `empresa_id`
- Criar Edge Function de webhook que recebe eventos do Stripe (`invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated/deleted`) e atualiza `subscription_status` na tabela `empresas`
- Adicionar `stripe_customer_id` e `stripe_subscription_id` à tabela `empresas`

#### Fase 2: Portal de billing para empresas
- Criar página `/assinatura` acessível pelo admin da empresa
- Mostrar plano atual, próxima cobrança, status
- Botão para acessar o Stripe Customer Portal (gerenciar cartão, cancelar, trocar plano)

#### Fase 3: Melhorar painel Financeiro do super_admin
- Mostrar MRR (receita recorrente mensal), churn, histórico
- Ações manuais: alterar status, conceder trial, forçar cancelamento
- Listar pagamentos recentes via Stripe API

#### Fase 4: Controle de limites por plano
- Criar tabela `planos` com limites (max_consultoras, max_uploads_mes, etc.)
- Vincular `empresas` a um plano
- Validar limites no frontend e nas Edge Functions

### Arquivos a criar/alterar
- Nova migration: adicionar `stripe_customer_id`, `stripe_subscription_id` à tabela `empresas`
- Nova Edge Function: `stripe-checkout` (criar sessão de checkout)
- Nova Edge Function: `stripe-webhook` (processar eventos)
- Nova página: `src/pages/Assinatura.tsx`
- Alterar: `src/pages/super-admin/Financeiro.tsx` (dados reais)
- Nova migration: tabela `planos` (fase 4)

