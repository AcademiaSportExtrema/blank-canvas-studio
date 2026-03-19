

## Remover preços e trocar botões por "Solicitar cadastro"

### O que muda

1. **Remover seção de preços inteira** — A section `#precos` com os cards Mensal/Anual será removida
2. **Trocar todos os botões "Teste grátis — 30 dias"** por **"Solicitar cadastro"** (mantendo link para `/cadastro`)
3. **Remover link "Preços" da navbar** — O `NAV_LINKS` perde o item `{ label: "Preços", href: "#precos" }`
4. **Ajustar CTA final** — Trocar o texto "Você está a 30 dias de ter uma equipe que bate meta sozinha" e o subtítulo para algo sem menção a teste grátis
5. **Ajustar FAQ** — Remover/editar a pergunta "Posso testar antes de assinar?" que menciona 30 dias grátis

### Locais afetados no `LandingPage.tsx`

| Local | Texto atual | Novo texto |
|-------|------------|------------|
| Navbar desktop (L198) | "Teste grátis — 30 dias" | "Solicitar cadastro" |
| Navbar mobile (L226) | "Teste grátis — 30 dias" | "Solicitar cadastro" |
| Hero botão (L262) | "Teste grátis — 30 dias →" | "Solicitar cadastro →" |
| CTA final (L439) | "Teste grátis — 30 dias →" | "Solicitar cadastro →" |
| CTA subtítulo (L431-432) | "Comece agora, sem cartão..." | "Solicite seu cadastro e comece a ver resultados." |
| CTA título (L429) | "Você está a 30 dias..." | "Pronto para ter uma equipe que bate meta sozinha?" |
| Seção preços (L321-377) | Cards de preço completos | **Removida** |
| NAV_LINKS (L166) | `{ label: "Preços", href: "#precos" }` | **Removido** |
| FAQ item 3 (L152) | "Posso testar antes de assinar?" | Remover ou adaptar |
| Seção header preços (L327-328) | "Teste grátis por 30 dias..." | **Removida junto** |

### Arquivo
- **Editado**: `src/pages/LandingPage.tsx`

