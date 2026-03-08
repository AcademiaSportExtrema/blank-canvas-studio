

## Plano: Cadastro completo de empresa com responsável financeiro

### Situação atual
A tabela `empresas` tem apenas: `nome`, `slug`, `ativo`, `subscription_status`, `trial_ends_at`, `logo_url`. O formulário tem 4 campos básicos (nome, slug, email admin, senha admin). Faltam dados cadastrais completos.

### Novos campos necessários

**Dados da Empresa:**
- `cnpj` (text, unique) -- CNPJ da empresa
- `razao_social` (text) -- Razão social
- `telefone` (text) -- Telefone principal
- `email` (text) -- Email institucional
- `endereco` (text) -- Endereço completo
- `cidade` (text)
- `estado` (text) -- UF (2 chars)
- `cep` (text)

**Responsável Financeiro:**
- `financeiro_nome` (text) -- Nome do responsável
- `financeiro_email` (text) -- Email do financeiro
- `financeiro_telefone` (text) -- Telefone/WhatsApp
- `financeiro_cpf` (text) -- CPF do responsável

**Assinatura:**
- `plano` (text, default 'basico') -- Plano contratado (para uso futuro com Stripe)

### Alterações

#### 1. Migration: adicionar colunas na tabela `empresas`
Adicionar todas as colunas acima como nullable (para não quebrar empresas existentes).

#### 2. Atualizar formulário `NovaEmpresa.tsx`
Reorganizar em 3 seções com cards separados:
- **Dados da Empresa**: nome, slug, cnpj, razao_social, telefone, email, endereco, cidade, estado, cep
- **Responsável Financeiro**: financeiro_nome, financeiro_email, financeiro_telefone, financeiro_cpf
- **Acesso do Administrador**: email_admin, senha_admin (campos existentes)

Campos obrigatórios: nome, slug, cnpj, email_admin, senha_admin, financeiro_nome, financeiro_email

#### 3. Atualizar Edge Function `create-empresa`
Receber e persistir os novos campos no insert da tabela `empresas`.

### Arquivos alterados
- Nova migration SQL (adicionar colunas)
- `src/pages/super-admin/NovaEmpresa.tsx` (formulário completo)
- `supabase/functions/create-empresa/index.ts` (persistir novos campos)

