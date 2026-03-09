

## Substituir métricas falsas por capturas de tela do sistema

A seção METRICS (linhas 287-301) mostra dados inventados (200+ empresas, 3.500+ consultoras, etc.). O plano é substituí-la por uma galeria de screenshots reais do sistema.

### Abordagem

**`src/pages/LandingPage.tsx`**:

1. **Remover** o array `METRICS` e a seção de cards de métricas (linhas 47-52 e 287-301)
2. **Substituir** por uma seção "Conheça o sistema" com 3-4 imagens do sistema em um layout de grid/carousel
3. Usar imagens placeholder por enquanto (`/placeholder.svg`) com labels descritivos como:
   - "Dashboard completo" 
   - "Gestão de Metas"
   - "Rankings e Performance"
   - "Relatórios detalhados"
4. Layout: grid responsivo com cards arredondados, borda sutil, e legenda embaixo de cada imagem
5. Estilo consistente com o tema dark da landing page

> **Nota**: As imagens ficarão como placeholders. Depois você pode substituí-las por screenshots reais do sistema fazendo upload das imagens.

