-- Add unique constraint on (empresa_id, data) for upsert to work
CREATE UNIQUE INDEX idx_fechamento_caixa_f360_empresa_data 
ON fechamento_caixa_f360 (empresa_id, data);

-- Clean up any existing duplicates first (keep latest)
DELETE FROM fechamento_caixa_f360 a
USING fechamento_caixa_f360 b
WHERE a.empresa_id = b.empresa_id 
  AND a.data = b.data 
  AND a.created_at < b.created_at;