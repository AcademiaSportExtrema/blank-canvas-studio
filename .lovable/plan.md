

## Problema

A tabela de Meta Anual calcula o "Realizado" via RPC SQL (`get_realizado_por_mes`) que soma lançamentos diretamente do banco. Porém a Tabela 2 (Receita por Duração) usa lógica complexa no frontend que inclui:

1. Lançamentos `entra_meta=true` com filtro de duração (exclui registros onde `data_inicio` e `data_lancamento` estão em meses diferentes para certas categorias)
2. Lançamentos Entuspass/Sport Pass (`entra_meta=false`)
3. Pagamentos agregadores (Wellhub, Total Pass) — da tabela `pagamentos_agregadores`, que **não existe** na RPC atual

Replicar toda essa lógica em SQL seria frágil e difícil de manter. A melhor abordagem é calcular o realizado no frontend usando os mesmos dados da Tabela 2.

## Solução

Passar o realizado já calculado como prop para `MetaAnualTable`, em vez de buscar via RPC.

### Alterações

**1. `src/pages/Relatorios.tsx`**
- Calcular um `Map<number, number>` (mês → total) a partir dos mesmos dados usados pela Tabela 2 (durValByMonth + wellhubByMonth + totalpassByMonth + entuspassByMonth), filtrando pelo ano selecionado em `metaAnualAno`
- Passar como prop `realizadoPorMes` para `MetaAnualTable`

**2. `src/components/relatorios/MetaAnualTable.tsx`**
- Adicionar prop opcional `realizadoPorMes?: number[]` (array de 12 posições)
- Se a prop for fornecida, usar ela em vez da RPC
- Remover a query RPC (ou mantê-la como fallback se a prop não existir)

### Resultado
Os valores de "Realizado" na Meta Anual passarão a ser idênticos aos totais da Tabela 2, pois usam exatamente a mesma fonte de dados e lógica de cálculo.

