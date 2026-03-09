

## Diagnóstico

O login é bem-sucedido (toast aparece), mas o redirecionamento não acontece porque:

1. **Console log**: `Failed to fetch user role: null` — a query em `user_roles` retorna `null` (nenhum registro encontrado para este usuário)
2. **Login.tsx linha 24**: O redirect depende de `user && role` — como `role` fica `null`, o `useEffect` nunca redireciona
3. **Resultado**: O usuário fica preso na tela de login autenticado mas sem role

A usuária `giulia@sportextrema.com.br` provavelmente não tem um registro na tabela `user_roles`, ou o RLS está bloqueando a leitura.

## Plano de Correção

### 1. Login.tsx — Tratar caso de usuário sem role
Adicionar lógica no `useEffect` de redirecionamento para detectar quando o auth terminou de carregar (`!authLoading`), o usuário existe (`user`), mas o role é `null`. Nesse caso, exibir um erro informativo e fazer signOut automático.

```
// Pseudo-lógica:
if (!authLoading && user && !role) {
  // Usuário autenticado mas sem permissão configurada
  setError('Sua conta não possui permissões configuradas. Contate o administrador.');
  signOut();
}
```

### 2. Verificar dados no banco
Verificar se existe registro em `user_roles` para o `user_id` desta usuária. Se não existir, o admin precisa criar o registro.

### Arquivos alterados
- **`src/pages/Login.tsx`** — Adicionar tratamento para usuário sem role (exibir erro + signOut)

