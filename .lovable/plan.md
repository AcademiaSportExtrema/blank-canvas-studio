
## Correção aplicada: Unificação das somatórias Dashboard ↔ Relatórios

### Problema
O Dashboard usava a RPC `get_realizado_por_mes` (soma simples por `data_inicio`) enquanto Relatórios usava lógica complexa da Tabela 2 (filtros de duração, agregadores, Entuspass). Isso causava divergências nos valores de "Realizado".

### Solução implementada
1. **Novo hook `useRealizadoMensal`** — centraliza a lógica da Tabela 2:
   - Lançamentos `entra_meta=true` com filtro de meses cruzados
   - Recorrentes contabilizados por `data_lancamento`
   - Entuspass/Sport Pass (`entra_meta=false`)
   - Pagamentos agregadores (Wellhub, Total Pass)

2. **Dashboard** — substituiu a query RPC por `useRealizadoMensal`
3. **Relatórios** — substituiu cálculo inline por `useRealizadoMensal`

### Resultado
Todos os valores de "Realizado" agora usam a mesma lógica de cálculo.
