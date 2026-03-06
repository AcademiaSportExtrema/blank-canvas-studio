

## Diagnóstico

Os logs de autenticação confirmam `Invalid login credentials` para `analistaadmsport@gmail.com` com a senha `Enzo@2026`. A senha atual no Supabase Auth não corresponde.

Há dois problemas:
1. **Senha incorreta no banco** -- precisa ser redefinida via Admin API
2. **Edge function `admin-reset-password` com bug** -- o parâmetro `filter` do `listUsers` não funciona como esperado na API Admin do Supabase. Precisa buscar por email de forma diferente.

## Plano

### 1. Corrigir a busca de usuário na Edge Function

Substituir o `listUsers({ filter: ... })` por uma iteração paginada que compara o email manualmente, ou usar `supabase.auth.admin.getUserByEmail()` (disponível em versões recentes do SDK):

```typescript
// Em vez de listUsers com filter quebrado:
const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
const targetUser = data?.users?.find(u => u.email === email);
```

### 2. Redefinir a senha do seu usuário

Após o deploy da função corrigida, usar o `curl_edge_functions` para chamar a função diretamente com service role e redefinir a senha para `Enzo@2026`.

Alternativamente, posso fazer o reset diretamente via a Supabase Auth Admin API usando curl.

### Arquivos alterados
- `supabase/functions/admin-reset-password/index.ts` -- corrigir busca por email

