

## Analise: Abas vs Menus separados no SaaS

### Situacao atual
O menu "SaaS" tem 5 itens no sidebar, cada um com sua propria pagina:
- **Empresas** (150 linhas) — lista de empresas com status e acoes
- **Nova Empresa** — formulario de cadastro
- **Usuarios** (434 linhas) — gestao de usuarios com impersonation, dialogs
- **Financeiro** (~400+ linhas) — KPIs, tabela de cobranca, registro de pagamento, historico
- **Integracoes** (10 linhas) — wrapper simples

### Recomendacao: Usar abas

Faz sentido consolidar em uma unica pagina com abas porque:
1. **Contexto unificado** — o super admin gerencia tudo sobre o SaaS, nao precisa navegar entre paginas
2. **Menos itens no sidebar** — o grupo SaaS fica com 1 item so, mais limpo
3. **Padrao ja usado no projeto** — a pagina `Configuracao.tsx` ja usa exatamente esse padrao com Tabs
4. **"Nova Empresa" nao precisa de menu proprio** — pode ser um botao dentro da aba Empresas (ja tem o link la)

### Estrutura proposta

Uma unica rota `/super-admin` com abas:
- **Empresas** (inclui botao "Nova Empresa" e link para detalhes)
- **Usuarios**
- **Financeiro**
- **Integracoes**

O sidebar ficaria com apenas 1 item: "SaaS" apontando para `/super-admin`.

### Alteracoes tecnicas

1. **Criar `src/pages/super-admin/SaasAdmin.tsx`** — pagina com `<Tabs>` contendo 4 abas
2. **Extrair conteudo** de cada pagina para componentes reutilizaveis:
   - `src/components/super-admin/EmpresasContent.tsx` (extrair de Empresas.tsx)
   - `src/components/super-admin/UsuariosContent.tsx` (extrair de Usuarios.tsx)
   - `src/components/super-admin/FinanceiroContent.tsx` (extrair de Financeiro.tsx)
   - Integracoes ja usa `IntegracoesTab` como componente
3. **Atualizar `AppSidebar.tsx`** — grupo SaaS com 1 item so (`/super-admin`)
4. **Atualizar `App.tsx`** — remover rotas individuais, manter apenas `/super-admin` e `/super-admin/empresa/:id` (detalhes precisa de rota propria)
5. **Remover paginas individuais** que nao serao mais usadas (ou manter redirect)

### Observacao
A pagina `EmpresaDetalhes.tsx` continuaria com rota propria (`/super-admin/empresa/:id`) pois e uma pagina de detalhe especifica.

