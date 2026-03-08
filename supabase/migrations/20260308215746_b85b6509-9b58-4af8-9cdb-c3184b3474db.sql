
ALTER TABLE public.empresas
  ADD COLUMN cnpj text UNIQUE,
  ADD COLUMN razao_social text,
  ADD COLUMN telefone text,
  ADD COLUMN email text,
  ADD COLUMN endereco text,
  ADD COLUMN cidade text,
  ADD COLUMN estado text,
  ADD COLUMN cep text,
  ADD COLUMN financeiro_nome text,
  ADD COLUMN financeiro_email text,
  ADD COLUMN financeiro_telefone text,
  ADD COLUMN financeiro_cpf text,
  ADD COLUMN plano text DEFAULT 'basico';
