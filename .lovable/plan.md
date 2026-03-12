

## Diagnóstico: Emails pararam de ser enviados após upload

### Investigação

Analisei o fluxo completo: Upload → `ai-analista` (gera análise + chama `send-analise-email`) → `send-analise-email` (envia via Resend).

### Causa raiz identificada: Nome do secret incorreto

O código em `send-analise-email` busca o secret com o nome `RESEND_API_KEY`:
```ts
const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";
```

Porém, o secret configurado no projeto se chama **`resend`** (não `RESEND_API_KEY`). Como `Deno.env.get("RESEND_API_KEY")` retorna `undefined`, a variável fica vazia e a função retorna erro 500: *"RESEND_API_KEY não configurada"*.

Quando o `ai-analista` recebe esse 500, ele apenas loga o erro silenciosamente e segue em frente — por isso a análise é gerada mas o email nunca é enviado.

### Causa secundária: `verify_jwt` não configurado

A função `send-analise-email` não tem `verify_jwt = false` no `config.toml`. Como ela é chamada internamente pelo `ai-analista` usando o service role key, o gateway do Supabase pode rejeitar a requisição antes dela chegar ao código.

### Correções

1. **`supabase/functions/send-analise-email/index.ts`** — Alterar `Deno.env.get("RESEND_API_KEY")` para `Deno.env.get("resend")` (nome real do secret)

2. **`supabase/config.toml`** — Adicionar `verify_jwt = false` para `send-analise-email` e `ai-analista`:
```toml
[functions.send-analise-email]
verify_jwt = false

[functions.ai-analista]
verify_jwt = false
```

3. **Melhorar logs no `ai-analista`** — Adicionar log mais explícito quando o email falha, para facilitar debug futuro

### Arquivos alterados
- `supabase/functions/send-analise-email/index.ts`
- `supabase/config.toml`
- `supabase/functions/ai-analista/index.ts` (logs)

