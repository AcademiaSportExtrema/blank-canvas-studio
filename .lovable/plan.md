

## Timeout de Inatividade com Aviso Popup

### O que será feito

1. **Novo hook `useInactivityTimeout`** — monitora eventos de interação do usuário (`mousemove`, `keydown`, `click`, `scroll`, `touchstart`). Após 25 minutos sem atividade, dispara um estado de aviso. Após 30 minutos, faz logout automático.

2. **Novo componente `InactivityWarningDialog`** — dialog modal que aparece aos 25 minutos restantes, mostrando contagem regressiva de 5 minutos com botão "Continuar logado" que reseta o timer.

3. **Integração no `App.tsx`** — renderizar o `InactivityWarningDialog` dentro do `AuthProvider`/`ImpersonationProvider`, só ativo quando há sessão.

### Detalhes técnicos

- O hook usa `setTimeout` e reseta a cada evento de interação (debounced a cada 1s para performance)
- Ao clicar "Continuar logado", reseta os timers para mais 30 minutos
- Ao expirar ou clicar "Sair", chama `signOut()` do `useAuth`
- O dialog mostra contagem regressiva em tempo real (minutos:segundos)
- Não ativa em rotas públicas (login, cadastro, landing)

### Arquivos

- **Novo**: `src/hooks/useInactivityTimeout.ts`
- **Novo**: `src/components/InactivityWarningDialog.tsx`
- **Editado**: `src/App.tsx` — adicionar o dialog

