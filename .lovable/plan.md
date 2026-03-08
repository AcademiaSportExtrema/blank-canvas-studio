

## Plano: Criar Landing Page institucional do MetasHub

Inspirado no design da imagem (tema escuro, moderno, seções bem definidas), vou criar uma landing page completa para o produto.

### Estrutura da página (seções)

1. **Navbar** — Logo "MetasHub", links (Recursos, Preços, FAQ), botões "Login" e "Começar agora"
2. **Hero** — Título grande, subtítulo, CTA, fundo escuro com gradiente/geometria sutil
3. **Social proof / Métricas** — 3-4 cards com números (empresas ativas, consultoras, metas batidas)
4. **Recursos principais** — 2 cards grandes lado a lado com ícones e descrições (Dashboard, IA Coach, etc.)
5. **Grid de funcionalidades** — 6 cards em grid 3x2 (Upload automático, Metas por nível, Ranking, Devedores, Relatórios, Multi-empresa)
6. **Planos e Preços** — 3 cards (Starter, Pro destacado, Custom) com toggle mensal/anual
7. **Depoimentos** — 2 cards com citações de clientes
8. **FAQ** — Accordion com perguntas frequentes
9. **CTA final** — Frase de impacto + botão
10. **Footer** — Links, redes sociais, copyright

### Design system

- Fundo: preto/cinza muito escuro (`bg-[#0a0a0f]`)
- Cards: cinza escuro com borda sutil, efeito glassmorphism leve
- Accent: ciano/teal (como na imagem) para CTAs e destaques
- Tipografia: branca, hierarquia clara com tamanhos grandes no hero
- Responsivo mobile-first

### Arquivos

| Arquivo | Ação |
|---------|------|
| `src/pages/LandingPage.tsx` | Criar — página completa com todas as seções |
| `src/App.tsx` | Editar — rota `/` aponta para LandingPage em vez de redirect para `/login` |

A página será auto-contida (sem sidebar/layout do app). Os botões "Login" e "Começar agora" linkam para `/login` e `/cadastro`.

