

## Plano: Adicionar card de configuração do Stripe na aba Integrações

A página de Integrações (`IntegracoesTab.tsx`) já possui cards para AbacatePay e Resend. Vamos adicionar um card similar para o Stripe.

### O que será feito

Adicionar um novo card **Stripe — Pagamentos** no componente `IntegracoesTab.tsx`, seguindo o mesmo padrão visual dos cards existentes:

- Ícone de cartão de crédito (CreditCard do lucide-react)
- Campo para **Stripe Secret Key** (sk_live_... ou sk_test_...) com toggle de visibilidade
- Campo para **Stripe Publishable Key** (pk_live_... ou pk_test_...)
- Campo para **Webhook Secret** (whsec_...)
- Badge de status (Pendente / Configurado)
- Botão Salvar que chama a edge function `save-integration-key` com provider `stripe`
- Link externo para o dashboard do Stripe

### Arquivo alterado
- `src/components/configuracao/IntegracoesTab.tsx` — adicionar card do Stripe após o card do Resend

