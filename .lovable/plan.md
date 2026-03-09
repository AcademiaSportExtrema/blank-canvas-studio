

## Remover seção "Conheça o sistema" da Landing Page

### Mudanças em `src/pages/LandingPage.tsx`

1. **Deletar a seção SCREENSHOTS** (linhas 284-312) — todo o bloco `<section>` com o grid de imagens
2. **Remover a constante `SCREENSHOTS`** (linhas ~44-55) que não será mais usada
3. **Remover o link "Ver recursos"** que aponta para `#recursos` via âncora (se fizer sentido manter, manter)

As imagens em `public/screenshots/` podem ficar — não causam problema.

