

## Problema: Loading infinito causado pelo fix anterior

### Causa raiz

A correção anterior adicionou `setIsLoading(true)` no `onAuthStateChange` para QUALQUER sessão. O problema:

1. `getSession` resolve → seta user → user.id effect roda → busca perfil → `isLoading = false`
2. `onAuthStateChange` dispara evento `INITIAL_SESSION` → seta `isLoading(true)` novamente
3. O effect de user.id NÃO re-executa (mesmo ID) → `isLoading` fica `true` para sempre

### Correção

**`src/hooks/useAuth.tsx`** -- No callback do `onAuthStateChange`, verificar o tipo do evento. Só setar `isLoading(true)` para eventos `SIGNED_IN` e `TOKEN_REFRESHED`, NÃO para `INITIAL_SESSION` (que já é tratado pelo bootstrap via `getSession`):

```ts
supabase.auth.onAuthStateChange((event, session) => {
  setSession(session);
  setUser(session?.user ?? null);

  if (event === 'SIGNED_IN') {
    setIsLoading(true);
  } else if (!session?.user) {
    resetProfile();
    setIsLoading(false);
  }
});
```

Isso mantém a proteção contra race condition no login (evento `SIGNED_IN`) sem quebrar o carregamento inicial (`INITIAL_SESSION`).

### Arquivo alterado
- **`src/hooks/useAuth.tsx`** -- Filtrar evento no onAuthStateChange para evitar re-setar isLoading no INITIAL_SESSION

