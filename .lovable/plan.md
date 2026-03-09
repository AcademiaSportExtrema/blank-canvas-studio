

## Problema

A função `get_realizado_por_mes` filtra apenas `entra_meta = true`, ou seja, soma somente lançamentos classificados como meta de vendas. O "Realizado" deveria considerar **todos** os lançamentos (vendas + gerencial), sem esse filtro.

## Solução

Atualizar a função SQL `get_realizado_por_mes` removendo a condição `AND l.entra_meta = true`, para que ela some **todos** os lançamentos da empresa naquele ano.

### Migration SQL

```sql
CREATE OR REPLACE FUNCTION public.get_realizado_por_mes(p_empresa_id uuid, p_ano integer)
RETURNS TABLE(mes integer, total numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    EXTRACT(MONTH FROM l.data_inicio)::integer AS mes,
    COALESCE(SUM(l.valor), 0) AS total
  FROM public.lancamentos l
  WHERE l.empresa_id = p_empresa_id
    AND EXTRACT(YEAR FROM l.data_inicio) = p_ano
  GROUP BY EXTRACT(MONTH FROM l.data_inicio)
$$;
```

### Arquivo alterado
- Nova migration SQL (apenas altera a função existente)
- Nenhuma alteração no frontend

