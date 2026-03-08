

## Plano: Remover página de Tickets do Super Admin

A página de Tickets de Suporte não é necessária no momento. Vamos removê-la do sistema.

### Alterações

1. **Remover rota** em `src/App.tsx` — remover a rota `/super-admin/tickets`
2. **Remover link do menu** em `src/components/layout/AppSidebar.tsx` — remover item "Tickets" da navegação do super_admin
3. **Deletar página** `src/pages/super-admin/Tickets.tsx`
4. **Remover import** do `Tickets` em `src/App.tsx`

