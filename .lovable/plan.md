

## Divergências Identificadas entre Dashboard e Relatórios

Após comparar os dois projetos (MetaHub original e MetasHUB2 atual), identifiquei as seguintes divergências nas somatórias:

### Divergência 1: "Realizado Gerencial" no Dashboard vs "Realizado" na Meta Anual (Relatórios)

**Dashboard** (linha 233-245): Usa a RPC `get_realizado_por_mes` que soma **TODOS** os lançamentos por `data_inicio`, sem nenhum filtro de `entra_meta`, sem excluir lançamentos com meses cruzados, sem incluir Wellhub/Total Pass/Entuspass.

**Relatórios → Meta Anual** (linha 818-839): Agora usa a lógica da Tabela 2 (duration filtering + Wellhub + Total Pass + Entuspass), que é a lógica correta segundo o último ajuste.

**Resultado**: O card "Meta Gerencial" no Dashboard mostra um valor diferente do "Realizado" na Meta Anual dos Relatórios para o mesmo mês.

### Divergência 2: "Total Vendido" no Dashboard

**Dashboard** (linha 182-193): Soma lançamentos com `entra_meta=true` e `mes_competencia = mesSelecionado`. Não aplica o filtro de duração (excluir registros onde `data_inicio` e `data_lancamento` estão em meses diferentes), e não inclui Entuspass/Wellhub/Total Pass.

**Relatórios Tabela 2**: Aplica filtros de duração e inclui agregadores. Os totais serão diferentes.

### Divergência 3: MetaHub original não passa realizadoPorMes

O projeto MetaHub original (linha 815) chama `<MetaAnualTable empresaId={empresaId} ano={metaAnualAno} />` **sem** a prop `realizadoPorMes`, então usa o fallback da RPC. O MetasHUB2 já corrigiu isso passando a prop.

---

## Plano de Correção

### 1. Corrigir o "Realizado Gerencial" no Dashboard
O Dashboard usa a RPC para calcular o `realizadoGerencial` (card de Meta Gerencial). Precisa usar a mesma lógica da Tabela 2.

**Alteração em `src/pages/Dashboard.tsx`**:
- Adicionar queries para `pagamentos_agregadores` e lançamentos `entuspass` (entra_meta=false com plano ENTUSPASS/SPORT PASS)
- Aplicar a mesma lógica de classificação por duração e filtragem de meses cruzados
- Calcular o realizado gerencial no frontend em vez de usar a RPC

Isso é complexo porque requer replicar a lógica de Relatórios no Dashboard. A abordagem mais limpa seria **extrair a lógica de cálculo da Tabela 2 para um hook reutilizável** e usá-lo tanto em Relatórios quanto no Dashboard.

### 2. Criar hook `useRealizadoMensal`
Novo hook em `src/hooks/useRealizadoMensal.ts` que:
- Recebe `empresaId` e opcionalmente um `mes` ou `ano`
- Busca lançamentos `entra_meta=true`, lançamentos entuspass, e pagamentos agregadores
- Aplica a lógica de duração (filtro de meses cruzados, recorrente por data_lancamento)
- Retorna o total por mês, consistente com a Tabela 2

### 3. Usar o hook no Dashboard
Substituir a query `realizadoGerencial` (que usa a RPC) pelo novo hook, garantindo que o card de Meta Gerencial mostre o mesmo valor que a Meta Anual nos Relatórios.

### 4. Usar o hook em Relatórios
Substituir a lógica inline de cálculo do `realizadoPorMes` no Relatórios pelo mesmo hook, eliminando duplicação.

### Arquivos alterados
- **Novo**: `src/hooks/useRealizadoMensal.ts` — hook com lógica da Tabela 2
- **Editado**: `src/pages/Dashboard.tsx` — usar hook para realizadoGerencial
- **Editado**: `src/pages/Relatorios.tsx` — usar hook para realizadoPorMes (opcional, para eliminar duplicação)

