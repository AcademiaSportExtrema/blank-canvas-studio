

## Corrigir botões da Landing Page

### Problemas identificados
1. O botão branco "Ver recursos" tem texto branco em fundo branco/transparente — ilegível
2. Todos os CTAs dizem "Começar grátis" ou "Começar grátis — 14 dias" — deve ser **"Teste grátis — 30 dias"**

### Mudanças em `src/pages/LandingPage.tsx`

1. **Trocar todos os textos de CTA** (4 ocorrências):
   - `"Começar grátis — 14 dias"` → `"Teste grátis — 30 dias"`
   - `"Começar grátis"` (3x) → `"Teste grátis — 30 dias"`

2. **Corrigir botão "Ver recursos"** (linha 272-279): trocar de `variant="outline"` com texto branco para um estilo legível — usar fundo branco com texto escuro (`bg-white text-gray-900 hover:bg-white/90`)

