

## Corrigir roles para usuários @sportextrema

### Diagnóstico
Os 5 registros em `user_roles` para as consultoras @sportextrema existem, mas os `user_id` provavelmente **não correspondem** aos IDs reais dos usuários em `auth.users`. Isso explica o erro "Failed to fetch user role: null" — o SELECT filtra por `user_id = auth.uid()` e não encontra nada.

Não é possível consultar `auth.users` via SQL direto. Precisamos usar a Admin API via edge function.

### Plano

**Criar edge function temporária `fix-sportextrema-roles`** que:
1. Lista todos os auth users com `listUsers()`
2. Filtra os que têm email `@sportextrema`
3. Para cada um, busca a consultora correspondente pelo email na tabela `consultoras`
4. Atualiza ou insere o `user_roles` com o `user_id` correto do Auth, `role: consultora`, `consultora_id` e `empresa_id`
5. Retorna um relatório do que foi feito

Depois de executar, a function pode ser removida.

### Arquivo
- **`supabase/functions/fix-sportextrema-roles/index.ts`** — edge function one-time que sincroniza os user_ids corretos

