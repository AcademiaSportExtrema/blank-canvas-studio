

## Dois cards lado a lado: Mensal e Anual

Remover o toggle mensal/anual e mostrar **dois cards lado a lado**:

### Card 1 — Mensal
- **R$ 297/mês**
- Texto: "Cobrança mensal, cancele quando quiser"
- Botão: "Começar grátis"
- Lista de features

### Card 2 — Anual (destacado)
- **R$ 3.024/ano** (valor cheio à vista)
- Subtexto: "Equivale a R$ 252/mês — economia de 15%"
- Badge "Mais popular" ou "-15%"
- Botão: "Começar grátis"
- Mesma lista de features

### Mudanças em `src/pages/LandingPage.tsx`

1. **Remover** o state `annual` e o bloco do toggle (linhas ~345-359)
2. **Substituir** o array `PLANS` por dois objetos: um mensal (R$ 297/mês) e um anual (R$ 3.024/ano, equivale a R$ 252/mês)
3. **Trocar** o layout de `max-w-md mx-auto` para `grid md:grid-cols-2 gap-6 max-w-3xl mx-auto`
4. Card anual recebe `highlighted: true` com borda ciano e glow; card mensal fica com estilo padrão

