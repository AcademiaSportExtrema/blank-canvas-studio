

## Plano: Automatizar fluxo de cobrança recorrente

### Situação atual
O fluxo é 100% manual: super admin registra pagamentos e altera status. Funciona, mas depende de lembrar de cobrar e verificar diariamente.

### O que implementar para tornar o fluxo robusto

#### 1. Cron job diário para atualizar status automaticamente
Edge function `check-vencimentos` executada diariamente via pg_cron:
- Busca empresas com `subscription_status = 'active'` e `proximo_vencimento < hoje`
- Atualiza para `past_due` automaticamente
- Busca empresas com `trial_ends_at < hoje` e `subscription_status = 'trialing'`
- Atualiza para `past_due` (trial expirado sem pagamento)
- Opcionalmente: empresas `past_due` há mais de 30 dias viram `canceled`

#### 2. Notificações por email (usando Resend, já configurado)
Edge function `notificar-vencimento` chamada pelo mesmo cron:
- 5 dias antes do vencimento: email de lembrete ao `financeiro_email`
- No dia do vencimento: email de cobrança
- 3 dias após vencimento: email de atraso
- Registra em tabela `notificacoes_cobranca` para evitar duplicatas

#### 3. Nova tabela `notificacoes_cobranca`
```
id, empresa_id, tipo (lembrete/cobranca/atraso), enviado_em, mes_referencia
```
Evita enviar o mesmo email duas vezes no mesmo ciclo.

#### 4. Dashboard: indicadores visuais de próximos vencimentos
Na página Financeiro, destacar visualmente:
- Amarelo: vence nos próximos 5 dias
- Vermelho: já venceu
- Verde: pago no mês atual

### Arquivos alterados
- Nova edge function `check-vencimentos/index.ts`
- Nova migration SQL (tabela `notificacoes_cobranca` + pg_cron schedule)
- `src/pages/super-admin/Financeiro.tsx` — indicadores visuais de vencimento

### Sobre integração com Stripe
Se quiser automatizar a cobrança (gerar boleto/PIX/cartão automaticamente), posso integrar o Stripe. Isso eliminaria a necessidade de registrar pagamentos manualmente — o Stripe avisaria via webhook quando o pagamento foi confirmado. Mas isso é um passo adicional que pode ser feito depois.

