
CREATE TABLE public.pagamentos_saas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  valor numeric NOT NULL DEFAULT 0,
  data_pagamento date NOT NULL,
  metodo text NOT NULL DEFAULT 'pix',
  mes_referencia text NOT NULL,
  observacao text,
  registrado_por uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pagamentos_saas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins full access pagamentos_saas"
ON public.pagamentos_saas
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));
