

## Reescrever Copy da Landing Page — Foco em Benefícios

### O que já foi feito
- Badge do hero corrigido para "Gestão de metas comerciais simplificada"

### O que falta implementar

Todas as alterações em `src/pages/LandingPage.tsx`:

#### 1. Hero Section (linhas 244-253)
- **Headline:** "Transforme metas em resultados reais" → **"Sua equipe vendendo mais. Todo mês."**
- **Subtítulo:** Trocar descrição de features por: **"Chega de planilhas perdidas e metas batidas no escuro. Veja quem está performando, quem precisa de ajuda e quanto falta — tudo em tempo real."**

#### 2. FEATURES_MAIN (linhas 45-58)
Reescrever com abordagem dor → solução:

| Atual | Novo título | Nova descrição |
|-------|------------|----------------|
| "Dashboard inteligente" + descrição técnica | "Pare de adivinhar se vai bater a meta" | "Veja o progresso do time em tempo real e aja antes de perder a semana. Sem esperar o fechamento do mês." |
| "IA Coach personalizado" + descrição técnica | "Cada consultora melhora sozinha" | "Dicas personalizadas baseadas no histórico de cada uma. O time se motiva sozinho — você só acompanha os resultados." |

#### 3. FEATURES_GRID (linhas 60-91)
Reescrever os 6 cards:

| Atual | Novo título | Nova descrição |
|-------|------------|----------------|
| Upload automático | "10 segundos para importar" | "Importe a planilha do ERP sem digitação e sem erro humano. O sistema classifica tudo." |
| Metas por nível | "Comissões no automático" | "Configure faixas uma vez. O sistema calcula quanto cada consultora ganha." |
| Ranking & gamificação | "O time se cobra sozinho" | "Ranking visível = competição saudável sem você precisar pressionar ninguém." |
| Gestão de devedores | "Nunca mais perca dinheiro" | "Saiba quem deve, quanto e há quantos dias. Cobrança organizada sem planilha." |
| Relatórios completos | "Fechamento em 1 clique" | "Relatório de caixa pronto para contabilidade ou diretoria. Exporta na hora." |
| Multi-empresa | "2 lojas ou 50, tudo junto" | "Cada unidade isolada, você vê tudo em um só painel." |

#### 4. Títulos de seção e CTA
- Seção de recursos: "Tudo que você precisa em um só lugar" → **"O que muda no seu dia a dia"**
- CTA final: "Pronto para bater todas as metas?" → **"Você está a 30 dias de ter uma equipe que bate meta sozinha"**
- Seção de preços: título ajustado para **"Comece a ver resultados em menos de 7 dias"**

#### 5. Depoimentos (se existentes)
Tornar mais específicos com resultados tangíveis.

### Arquivo alterado
- `src/pages/LandingPage.tsx` — constantes de dados + textos inline nas seções hero, features, preços e CTA

