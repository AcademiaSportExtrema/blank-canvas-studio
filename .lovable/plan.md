

## Atualizar preços na Landing Page

A seção de preços da landing page (`src/pages/LandingPage.tsx`) ainda mostra os 3 planos antigos (Starter R$197, Pro R$397, Enterprise). Precisa ser atualizado para o plano único aprovado anteriormente.

### Mudança

**`src/pages/LandingPage.tsx`** — Substituir o array `PLANS` (linhas 102-144) por um único plano:

- **MetasHub Pro** — R$ 297/mês (mensal) / R$ 252/mês (anual, -15%)
- Features: todos os recursos combinados dos 3 planos antigos
- `highlighted: true`

E ajustar o grid de pricing (linha 385) de `md:grid-cols-3` para layout centralizado com `max-w-md mx-auto` para o card único.

