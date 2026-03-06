

## Diagnóstico

O seu usuário (`analistaadmsport@gmail.com`) foi cadastrado com role `admin`, mas o módulo "Plataforma" (Empresas, Nova Empresa, Usuários, Tickets, Financeiro, Integrações) só aparece para usuários com role `super_admin`.

O sidebar verifica `isSuperAdmin` (que é `role === 'super_admin'`) antes de renderizar esse grupo de menus, e as rotas `/super-admin/*` exigem `requiredRole="super_admin"` no `ProtectedRoute`.

## Plano

Alterar o role do seu usuário de `admin` para `super_admin` via migration SQL:

```sql
UPDATE public.user_roles
SET role = 'super_admin'
WHERE user_id = '4242b925-f435-4ffb-9860-560ab4acbf7e';
```

Após isso, ao relogar (ou recarregar a página), o menu "Plataforma" aparecerá e as rotas super-admin ficarão acessíveis.

Nenhuma alteração de código é necessária -- apenas a correção do dado no banco.

