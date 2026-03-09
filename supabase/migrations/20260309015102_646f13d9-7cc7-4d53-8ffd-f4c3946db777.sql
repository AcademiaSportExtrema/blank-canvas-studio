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