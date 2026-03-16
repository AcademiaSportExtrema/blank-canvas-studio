
-- Clean duplicates keeping the latest record per (empresa_id, mes_referencia)
DELETE FROM public.analise_ia a
WHERE a.id NOT IN (
  SELECT DISTINCT ON (empresa_id, mes_referencia) id
  FROM public.analise_ia
  ORDER BY empresa_id, mes_referencia, created_at DESC
);

-- Add UNIQUE constraint
ALTER TABLE public.analise_ia
ADD CONSTRAINT analise_ia_empresa_mes_unique UNIQUE (empresa_id, mes_referencia);
