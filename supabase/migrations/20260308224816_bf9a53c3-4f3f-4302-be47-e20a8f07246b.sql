
CREATE TYPE public.notificacao_cobranca_tipo AS ENUM ('lembrete', 'cobranca', 'atraso');

CREATE TABLE public.notificacoes_cobranca (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  tipo notificacao_cobranca_tipo NOT NULL,
  enviado_em timestamptz NOT NULL DEFAULT now(),
  mes_referencia text NOT NULL
);

ALTER TABLE public.notificacoes_cobranca ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins full access notificacoes_cobranca"
ON public.notificacoes_cobranca
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE UNIQUE INDEX idx_notificacoes_cobranca_unico 
ON public.notificacoes_cobranca (empresa_id, tipo, mes_referencia);
