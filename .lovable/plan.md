

## Por que o email não está sendo enviado após o upload

### Problemas identificados

Há **3 problemas** na cadeia upload → ai-analista → send-analise-email:

1. **Falta de constraint UNIQUE na tabela `analise_ia`**: O `ai-analista` faz `upsert` com `onConflict: "empresa_id,mes_referencia"`, mas não existe uma constraint unique nessas colunas. Isso causa erro no `upsert`, que impede o salvamento da análise e, consequentemente, o disparo do email.

2. **`getUser()` pode falhar com sessão expirada**: A função `ai-analista` usa `supabase.auth.getUser()` que depende de uma sessão ativa no banco. Se a sessão expirou, a função retorna 401 antes de fazer qualquer coisa. Já corrigimos isso em outras funções com `getClaims()`.

3. **Erros silenciosos no streaming**: Como a resposta é streamed, erros que ocorrem dentro do `ReadableStream.start()` (salvar análise, disparar email) são apenas logados com `console.error` mas nunca chegam ao cliente.

### Plano de correção

**Passo 1 — Criar constraint UNIQUE na `analise_ia`**
- Migração SQL: `ALTER TABLE analise_ia ADD CONSTRAINT analise_ia_empresa_mes_unique UNIQUE (empresa_id, mes_referencia);`
- Pode haver duplicatas existentes que precisam ser limpas antes

**Passo 2 — Corrigir autenticação no `ai-analista`**
- Trocar `supabase.auth.getUser()` por `getClaims(token)` como já feito em `list-users-admin` e `admin-empresa-details`

**Passo 3 — Redeployar as funções**
- Deploy de `ai-analista` e `send-analise-email` com as correções

### Resultado esperado

Após o upload ser processado, o `ai-analista` vai gerar a análise, salvar via upsert (agora com constraint correta), e disparar automaticamente o `send-analise-email` para os destinatários configurados.

