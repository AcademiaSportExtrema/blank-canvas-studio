## Diagnóstico: Loading infinito (recorrente)

### Causa raiz

O `onAuthStateChange` recebe o evento `SIGNED_IN` durante **refresh de token** (mesmo user.id). O código atual faz `setIsLoading(true)` nesse caso. Como o `user.id` não mudou, o segundo `useEffect` (que busca perfil e faz `setIsLoading(false)`) **não re-executa**. Resultado: `isLoading` fica `true` para sempre.

Isso explica por que o problema é intermitente — só acontece quando o token expira e é renovado automaticamente.

### Correção

`**src/hooks/useAuth.tsx**` — Remover `setIsLoading(true)` do `onAuthStateChange` e deixar apenas o efeito de `user.id` gerenciar o estado de loading. Para proteger contra race conditions no login real, comparar o user.id anterior antes de setar loading:

```ts
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (!session?.user) {
        resetProfile();
        setIsLoading(false);
      }
    }
  );

  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
    setUser(session?.user ?? null);
    if (!session?.user) {
      setIsLoading(false);
    }
  });

  return () => subscription.unsubscribe();
}, [resetProfile]);
```

A lógica de `setIsLoading(true)` já existe no efeito #2 (linha 78), que dispara sempre que `user.id` muda. Isso cobre:

- Login inicial (user.id muda de null para valor)
- Troca de conta (user.id muda)
- Token refresh (user.id não muda → efeito não re-executa → isLoading não é resetado para true)

### Arquivo alterado

- `**src/hooks/useAuth.tsx**` — Remover `setIsLoading(true)` do callback `onAuthStateChange`

### Testes necessários

Após a correção, preciso que você faça login no preview para eu testar:

1. Login como consultora → verificar `/solicitar-ajuste` e `/minha-performance`
2. Login como admin → verificar `/dashboard` e demais páginas  
  
faça o login com as duas credenciais e teste novamente:  
Consultora:   
[livia@sportextrema.com.br](mailto:livia@sportextrema.com.br)  
Livia@2026  
  
admin:  
[analistaadmsport@gmail.com](mailto:analistaadmsport@gmail.com)
  Enzo@2026