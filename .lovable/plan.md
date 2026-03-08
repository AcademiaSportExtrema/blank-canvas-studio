

## Plano: Renomear "Plataforma" para "SaaS" e expandir página Financeiro

### 1. Renomear label no sidebar
- `src/components/layout/AppSidebar.tsx` linha 78: mudar `label: 'Plataforma'` para `label: 'SaaS'`

### 2. Adicionar colunas de cobrança na tabela `empresas`
Migration para adicionar:
- `valor_mensal` (numeric, default 0) — valor do plano mensal
- `dia_vencimento` (integer, default 10) — dia do mês para cobrança
- `stripe_customer_id` (text, nullable) — ID do cliente no Stripe
- `stripe_subscription_id` (text, nullable) — ID da assinatura no Stripe
- `ultimo_pagamento_em` (timestamptz, nullable) — data do último pagamento recebido
- `proximo_vencimento` (date, nullable) — próxima data de cobrança

### 3. Expandir página Financeiro (`src/pages/super-admin/Financeiro.tsx`)

**Cards de resumo (KPIs):**
- Ativas | Inadimplentes | Canceladas | Em Trial
- MRR (receita recorrente mensal) = soma de `valor_mensal` das ativas

**Tabela completa com colunas:**
- Empresa | Plano | Valor Mensal | Status Assinatura | Próximo Vencimento | Último Pagamento | Trial até | Ações

**Funcionalidades na tabela:**
- Badge colorido por status (active=verde, past_due=amarelo, canceled=vermelho, trialing=azul)
- Edição inline do valor mensal e dia de vencimento via dialog
- Botão para alterar status manualmente (active/past_due/canceled)
- Filtro por status de assinatura
- Exibição de trial_ends_at formatado quando aplicável

### Arquivos alterados
- `src/components/layout/AppSidebar.tsx` — renomear label
- Nova migration SQL — adicionar colunas de cobrança
- `src/pages/super-admin/Financeiro.tsx` — reescrever com KPIs, MRR, tabela completa e ações

