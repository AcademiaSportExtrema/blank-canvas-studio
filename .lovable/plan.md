

## Fix: Privilege Escalation on `user_roles`

### Problem

The RLS policy "Admins manage own empresa roles" allows admins to INSERT/UPDATE rows with `role = 'super_admin'`, giving themselves full platform access.

### Fix

Update the WITH CHECK condition to add `AND role != 'super_admin'::app_role`, preventing admins from assigning the super_admin role.

### SQL Migration

```sql
DROP POLICY "Admins manage own empresa roles" ON public.user_roles;

CREATE POLICY "Admins manage own empresa roles"
ON public.user_roles
FOR ALL
TO public
USING (
  has_role(auth.uid(), 'admin'::app_role)
  AND empresa_id = get_user_empresa_id(auth.uid())
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  AND empresa_id = get_user_empresa_id(auth.uid())
  AND role != 'super_admin'::app_role
);
```

### Files
- **New migration**: drops and recreates the policy with the restricted check

