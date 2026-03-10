

## Restringir ajustes ao mês corrente

### Problema
A função `search_lancamentos_for_ajuste` retorna lançamentos de qualquer mês. A consultora deveria ver apenas lançamentos do mês corrente.

### Solução

**Alterar a função SQL `search_lancamentos_for_ajuste`** para adicionar um filtro por `mes_competencia` igual ao mês atual (formato `YYYY-MM`):

```sql
AND l.mes_competencia = to_char(now(), 'YYYY-MM')
```

Isso garante que apenas lançamentos do mês corrente apareçam nos resultados de busca para solicitação de ajuste. Nenhuma alteração no frontend é necessária.

### Arquivo alterado
- **Nova migration SQL** — Recriar a função com filtro de mês corrente

