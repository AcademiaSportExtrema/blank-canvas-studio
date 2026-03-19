
-- Create lead_status enum
CREATE TYPE public.lead_status AS ENUM ('novo', 'aprovado', 'rejeitado');

-- Create site_leads table
CREATE TABLE public.site_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text NOT NULL,
  telefone text,
  nome_empresa text NOT NULL,
  segmento text,
  qtd_consultoras text,
  como_conheceu text,
  status lead_status NOT NULL DEFAULT 'novo',
  observacao_admin text,
  aprovado_por uuid,
  empresa_id uuid REFERENCES public.empresas(id),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_leads ENABLE ROW LEVEL SECURITY;

-- Anon can insert (public form)
CREATE POLICY "Anon insert site_leads"
  ON public.site_leads FOR INSERT
  TO anon
  WITH CHECK (true);

-- Super admins full access
CREATE POLICY "Super admins full access site_leads"
  ON public.site_leads FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));
