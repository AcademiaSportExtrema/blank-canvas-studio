
CREATE TABLE public.ai_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  funcao text NOT NULL,
  user_id uuid,
  tokens_estimados integer NOT NULL DEFAULT 0,
  modelo text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins full access ai_usage_logs"
  ON public.ai_usage_logs FOR ALL TO public
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins read own empresa ai_usage_logs"
  ON public.ai_usage_logs FOR SELECT TO public
  USING (has_role(auth.uid(), 'admin'::app_role) AND empresa_id = get_user_empresa_id(auth.uid()));

CREATE INDEX idx_ai_usage_logs_empresa_created ON public.ai_usage_logs (empresa_id, created_at DESC);
