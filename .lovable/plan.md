

## Problema: Race Condition no Login

Após o login, existe um breve momento onde:
- `isLoading = false` (definido no bootstrap)
- `user = set` (definido pelo onAuthStateChange)
- `role = null` (fetch ainda não iniciou)

Isso faz o Login.tsx interpretar como "usuário sem permissão" e chamar `signOut()`.

## Correção

### `src/hooks/useAuth.tsx`
No callback do `onAuthStateChange`, quando uma sessão é detectada (novo login), definir `isLoading = true` **imediatamente** antes que o efeito de fetch do role execute. Isso garante que o Login.tsx não entre na condição `!authLoading && user && !role` prematuramente.

```ts
// No onAuthStateChange callback:
if (session?.user) {
  setIsLoading(true);  // ← adicionar esta linha
}
```

Isso fecha a janela de race condition: `isLoading` será `true` desde o momento que o user é setado até o fetch do role completar.

### Arquivo alterado
- **`src/hooks/useAuth.tsx`** — Adicionar `setIsLoading(true)` no onAuthStateChange quando há sessão

