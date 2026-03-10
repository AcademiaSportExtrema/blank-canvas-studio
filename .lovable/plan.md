

## Diagnóstico

### Problema Principal: Função RPC não existe no banco
A função `search_lancamentos_for_ajuste` **não existe** no banco de dados. A migration que a cria (`20260218201732`) nunca foi aplicada. Quando a consultora pesquisa, o RPC falha silenciosamente e nenhum resultado aparece.

Os dados existem — "YASMIN FELIX DE OLIVEIRA PRETO" tem 18 lançamentos (16 com `entra_meta = true`). O problema é puramente a função ausente.

### Sobre velocidade
O banco tem ~1.742 lançamentos, volume baixo. A busca via ILIKE é adequada para esse tamanho. Não há problema de performance.

## Plano de Correção

### 1. Criar a função `search_lancamentos_for_ajuste` via migration

```sql
CREATE OR REPLACE FUNCTION public.search_lancamentos_for_ajuste(
  _search text DEFAULT '',
  _limit int DEFAULT 20
)
RETURNS TABLE(
  id uuid, produto text, nome_cliente text, numero_contrato text,
  resp_venda text, resp_recebimento text, valor numeric,
  data_lancamento date, empresa text, plano text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT l.id, l.produto, l.nome_cliente, l.numero_contrato,
    l.resp_venda, l.resp_recebimento, l.valor, l.data_lancamento,
    l.empresa, l.plano
  FROM public.lancamentos l
  WHERE auth.uid() IS NOT NULL
    AND l.entra_meta = true
    AND l.empresa_id = get_user_empresa_id(auth.uid())
    AND (_search = '' OR
         l.numero_contrato ILIKE '%' || _search || '%' OR
         l.nome_cliente ILIKE '%' || _search || '%' OR
         l.resp_venda ILIKE '%' || _search || '%' OR
         l.resp_recebimento ILIKE '%' || _search || '%')
  ORDER BY l.data_lancamento DESC NULLS LAST
  LIMIT _limit;
$$;
```

Isso é tudo — uma única migration resolve o problema. Nenhuma alteração de código necessária.

### Arquivos alterados
- **Nova migration SQL** — Criar a função `search_lancamentos_for_ajuste`

