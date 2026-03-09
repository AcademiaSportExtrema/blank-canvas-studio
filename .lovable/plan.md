

## Adicionar screenshots reais na landing page

As 4 imagens enviadas substituirão os placeholders na seção "Conheça o sistema".

### Mudanças

1. **Copiar imagens para `public/screenshots/`**:
   - `image-11.png` → `public/screenshots/metas.png` (Tela de Metas)
   - `image-12.png` → `public/screenshots/distribuicao-semanal.png` (Distribuição Semanal)
   - `image-13.png` → `public/screenshots/meta-consultora.png` (Meta por Consultora)
   - `image-14.png` → `public/screenshots/niveis-comissao.png` (Níveis de Comissão)

2. **Atualizar `SCREENSHOTS` em `src/pages/LandingPage.tsx`** (linhas 44-49):
   - Trocar os 4 entries para usar as novas imagens com labels descritivos:
     - Dashboard completo (mantém o existente)
     - Gestão de Metas → `metas.png`
     - Distribuição Semanal da Meta → `distribuicao-semanal.png`
     - Meta por Consultora → `meta-consultora.png`
     - Níveis de Comissão → `niveis-comissao.png`
   - Total: 5 screenshots (o dashboard existente + 4 novos)

3. **Ajustar grid** se necessário para acomodar 5 itens (ou manter 4 removendo o dashboard duplicado, dependendo da preferência — sugiro manter os 5 com layout `md:grid-cols-2` que já existe, ficando 3+2).

