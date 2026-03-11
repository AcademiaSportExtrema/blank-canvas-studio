
ALTER TABLE public.devedores_cobranca_historico
  DROP CONSTRAINT devedores_cobranca_historico_devedor_parcela_id_fkey,
  ADD CONSTRAINT devedores_cobranca_historico_devedor_parcela_id_fkey
    FOREIGN KEY (devedor_parcela_id)
    REFERENCES public.devedores_parcelas(id)
    ON DELETE SET NULL;
