-- 1. Delete duplicate lancamentos, keeping the oldest (smallest created_at) per (empresa_id, hash_linha)
DELETE FROM lancamentos
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY empresa_id, hash_linha ORDER BY created_at ASC) AS rn
    FROM lancamentos
    WHERE hash_linha IS NOT NULL AND hash_linha != ''
  ) ranked
  WHERE rn > 1
);

-- 2. Add unique constraint so future duplicates are rejected (triggers 23505 error code)
CREATE UNIQUE INDEX IF NOT EXISTS idx_lancamentos_empresa_hash_unique
ON lancamentos (empresa_id, hash_linha)
WHERE hash_linha IS NOT NULL AND hash_linha != '';