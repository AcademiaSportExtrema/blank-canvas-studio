

## Analise: O que falta no Financeiro do SaaS

### O que ja temos
- KPIs: Ativas, Inadimplentes, Canceladas, Em Trial, MRR
- Tabela de empresas com status, valor mensal, proximo vencimento, ultimo pagamento
- Alteracao de status inline (active/past_due/canceled/trialing)
- Edicao de valor mensal e dia de vencimento via dialog
- Filtro por status

### O que falta para gestao completa de recebimentos

**1. Historico de Pagamentos (tabela nova `pagamentos_saas`)**
Registrar cada pagamento recebido com: empresa_id, valor, data_pagamento, metodo (pix/boleto/cartao/transferencia), observacao, registrado_por. Sem isso nao ha rastro de quem pagou quando.

**2. Acao "Registrar Pagamento" na tabela**
Botao por empresa que abre dialog para informar valor recebido, data e metodo. Ao salvar, insere em `pagamentos_saas`, atualiza `ultimo_pagamento_em` e calcula `proximo_vencimento` automaticamente.

**3. Calculo de dias em atraso**
Coluna na tabela mostrando quantos dias a empresa esta em atraso (quando `proximo_vencimento < hoje` e status != canceled). Destacar em vermelho empresas com atraso > 0.

**4. Dados do responsavel financeiro na tabela**
Exibir `financeiro_nome`, `financeiro_email`, `financeiro_telefone` (ja existem na tabela `empresas`) para facilitar cobranca sem sair da tela.

**5. Exportar CSV**
Botao para exportar a tabela filtrada em CSV para controle externo.

### Alteracoes tecnicas

#### Migration: criar tabela `pagamentos_saas`
```
id, empresa_id, valor, data_pagamento, metodo (pix/boleto/cartao/transferencia), 
mes_referencia, observacao, registrado_por (uuid), created_at
```
RLS: super_admin full access.

#### Atualizar query em `Financeiro.tsx`
Buscar tambem `financeiro_nome, financeiro_email, financeiro_telefone` da tabela empresas.

#### Novos componentes no `Financeiro.tsx`
- Dialog "Registrar Pagamento" com campos valor, data, metodo, observacao
- Coluna "Dias Atraso" calculada no frontend
- Expansao da linha ou tooltip com dados do responsavel financeiro
- Botao exportar CSV
- Aba ou secao de historico de pagamentos por empresa

### Arquivos alterados
- Nova migration SQL (tabela `pagamentos_saas` + RLS)
- `src/pages/super-admin/Financeiro.tsx` (reescrever com todas as funcionalidades)

