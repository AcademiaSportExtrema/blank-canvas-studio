

## Problema

A coluna "Realizado" na tabela de Meta Anual mostra R$ 0,00 porque a função RPC `get_realizado_por_mes` **não existe** no banco de dados. O componente `MetaAnualTable` chama essa RPC (linha 75), mas ela nunca foi criada no Supabase. O erro retornado é:

> `Could not find the function public.get_realizado_por_mes(p_ano, p_empresa_id) in the schema cache`

## Solução

Criar a função SQL `get_realizado_por_mes` no Supabase via migration. Ela deve agregar os valores da tabela `lancamentos` onde `entra_meta = true`, agrupando por mês do ano.

### Migration SQL

Criar a função RPC que:
1. Recebe `p_empresa_id (uuid)` e `p_ano (integer)`
2. Consulta `lancamentos` filtrando por `empresa_id`, `entra_meta = true`, e o ano extraído de `mes_competencia` (formato `YYYY-MM`)
3. Retorna `mes (integer)` e `total (numeric)` agrupados por mês
4. Usa `SECURITY DEFINER` para respeitar o padrão existente, com `search_path = public`

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
    AND l.entra_meta = true
    AND EXTRACT(YEAR FROM l.data_inicio) = p_ano
  GROUP BY EXTRACT(MONTH FROM l.data_inicio)
$$;
```

**Nota sobre o campo de data:** A tabela `lancamentos` tem `data_inicio`, `data_lancamento` e `mes_competencia`. Usarei `data_inicio` pois é o campo usado no hook `useMetaSemanal` para agrupar vendas por semana, mantendo consistência. O `mes_competencia` é texto (`YYYY-MM`) e poderia ser alternativa, mas `data_inicio` é mais preciso.

### Arquivo alterado
- Nova migration SQL com a função `get_realizado_por_mes`

### Nenhuma alteração no frontend
O componente `MetaAnualTable` já está preparado para consumir o resultado dessa RPC (linhas 72-93). Assim que a função existir, os dados aparecerão automaticamente.

