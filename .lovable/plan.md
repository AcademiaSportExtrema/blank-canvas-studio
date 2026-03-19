

## Novo Onboarding: Formulário de Inscrição → Leads → Aprovação → Tenant Ativo

### O que muda

O cadastro atual (email + senha → cria conta Supabase direto) será substituído por um **formulário multi-step de inscrição** inspirado no projeto BIA SDR. O lead cai numa tabela `site_leads` para aprovação do super_admin. Ao aprovar, o sistema cria automaticamente a empresa + usuário admin (reutilizando a lógica do `create-empresa`).

### Fluxo

```text
Landing/Cadastro → Formulário multi-step → Salva em site_leads (status: "novo")
                                              ↓
Super Admin → Aba "Leads" no SaasAdmin → Visualiza leads pendentes
                                              ↓
                    Clica "Aprovar" → Preenche senha admin → Chama create-empresa
                                              ↓
                    Empresa criada + user admin + permissões → Lead status: "aprovado"
```

### Detalhes técnicos

**1. Nova tabela `site_leads`** (migração SQL)
- `id`, `nome`, `email`, `telefone`, `nome_empresa`, `segmento`, `qtd_consultoras`, `como_conheceu`, `status` (enum: `novo`, `aprovado`, `rejeitado`), `observacao_admin`, `aprovado_por`, `empresa_id` (preenchido após aprovação), `created_at`
- RLS: super_admin full access, insert público (anon) para o formulário

**2. Nova Edge Function `submit-site-lead`**
- Recebe os dados do formulário, valida, insere na tabela `site_leads` com `status: 'novo'`
- Sem autenticação necessária (chamada pública do site)
- Segue o padrão do BIA SDR com validação de tamanho e sanitização

**3. Reformular `src/pages/Cadastro.tsx`**
- Formulário multi-step (3 etapas):
  - **Step 1**: Nome, Email, Telefone/WhatsApp
  - **Step 2**: Nome da Empresa, Segmento, Quantidade de consultoras
  - **Step 3**: Como conheceu o MetasHub
- Barra de progresso visual (1/3, 2/3, 3/3)
- Tela de sucesso: "Inscrição enviada! Nossa equipe entrará em contato em breve."
- Remove `signUp` — não cria conta Supabase, apenas salva o lead

**4. Novo componente `src/components/super-admin/LeadsContent.tsx`**
- Tabela com leads pendentes (status = `novo`)
- Colunas: Nome, Email, Empresa, Segmento, Consultoras, Data
- Ações: "Aprovar" (abre modal para definir slug e senha do admin) e "Rejeitar"
- Ao aprovar: chama `create-empresa` com os dados do lead, atualiza `site_leads.status` para `aprovado`

**5. Integrar aba "Leads" no SaasAdmin**
- Adicionar nova aba no `src/pages/super-admin/SaasAdmin.tsx` com o `LeadsContent`

### Arquivos

- **Nova migração SQL**: cria enum `lead_status`, tabela `site_leads`, RLS policies
- **Nova**: `supabase/functions/submit-site-lead/index.ts`
- **Nova**: `src/components/super-admin/LeadsContent.tsx`
- **Editado**: `src/pages/Cadastro.tsx` — formulário multi-step sem criação de conta
- **Editado**: `src/pages/super-admin/SaasAdmin.tsx` — nova aba Leads
- **Editado**: `supabase/config.toml` — `verify_jwt = false` para `submit-site-lead`

