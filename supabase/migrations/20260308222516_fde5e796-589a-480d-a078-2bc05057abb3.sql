ALTER TABLE public.empresas
  ADD COLUMN IF NOT EXISTS valor_mensal numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS dia_vencimento integer NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS ultimo_pagamento_em timestamptz,
  ADD COLUMN IF NOT EXISTS proximo_vencimento date;